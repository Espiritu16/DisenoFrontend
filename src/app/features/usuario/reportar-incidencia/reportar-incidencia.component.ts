import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';
import { ReportesService } from '../../../core/api/reportes.service';
import { UploadService } from '../../../core/api/upload.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { NotificationService } from '../../../shared/notifications/notification.service';

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

type SubmitState = 'idle' | 'uploading' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-reportar-incidencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reportar-incidencia.component.html',
  styleUrl: './reportar-incidencia.component.css'
})
export class ReportarIncidenciaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('direccionInput') direccionInput?: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  distrito = 'Cercado de Lima';
  tipo = 'Fuga';
  detail = '';
  direccion = '';
  referencia = '';
  imageName = '';
  imageNames: string[] = [];
  selectedImages: SelectedImage[] = [];

  lat = -12.0464;
  lng = -77.0428;
  message = '';
  mapMessage = '';
  resolvingAddress = false;
  submitting = false;
  submitState: SubmitState = 'idle';

  distritos = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'Cercado de Lima',
    'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho (Chosica)',
    'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
    'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
    'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];

  private map?: L.Map;
  private marker?: L.Marker;
  private limaLayer?: L.GeoJSON;
  private readonly mapId = 'report-map';
  private limaGeometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  private lastValid = { lat: this.lat, lng: this.lng };
  private reverseRequestId = 0;
  private readonly uploadTimeoutMs = 30000;
  private readonly reportTimeoutMs = 30000;

  constructor(
    private auth: AuthService,
    private reportesService: ReportesService,
    private uploadService: UploadService,
    private notifications: NotificationService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  get isLoggedIn(): boolean {
    return Boolean(this.auth.token);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.clearSelectedImages();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapId, {
      center: [this.lat, this.lng],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const icon = L.divIcon({ className: 'report-pin-wrap', html: '<span class="report-pin"></span>', iconSize: [24, 24], iconAnchor: [12, 24] });
    this.marker = L.marker([this.lat, this.lng], { draggable: true, icon }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.setCoords(e.latlng.lat, e.latlng.lng, true));
    this.map.on('dblclick', (e: L.LeafletMouseEvent) => this.setCoords(e.latlng.lat, e.latlng.lng, true));
    this.marker.on('dragend', () => {
      const p = this.marker!.getLatLng();
      this.setCoords(p.lat, p.lng, false);
    });

    void this.loadLimaBoundary();
    void this.reverseGeocode(this.lat, this.lng);

    setTimeout(() => this.map?.invalidateSize(), 120);
  }

  private setCoords(lat: number, lng: number, recenter: boolean): void {
    this.zone.run(() => {
      if (!this.isInsideLima(lat, lng)) {
        this.mapMessage = 'La ubicación debe estar dentro de la Provincia de Lima.';
        this.lat = Number(this.lastValid.lat.toFixed(6));
        this.lng = Number(this.lastValid.lng.toFixed(6));
        if (this.marker) this.marker.setLatLng([this.lat, this.lng]);
        if (this.map) this.map.panTo([this.lat, this.lng], { animate: true });
        return;
      }

      this.mapMessage = '';
      this.lat = Number(lat.toFixed(6));
      this.lng = Number(lng.toFixed(6));
      this.lastValid = { lat: this.lat, lng: this.lng };
      this.setDireccionValue(`Ubicación seleccionada (${this.lat.toFixed(6)}, ${this.lng.toFixed(6)})`);
      if (this.marker) this.marker.setLatLng([this.lat, this.lng]);
      if (recenter && this.map) this.map.panTo([this.lat, this.lng], { animate: true });
      this.resolvingAddress = true;
      void this.reverseGeocode(this.lat, this.lng);
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const validImages = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        this.message = 'Solo se permiten imágenes.';
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.message = `La imagen ${file.name} supera 10MB.`;
        return false;
      }
      return true;
    });

    this.selectedImages = [
      ...this.selectedImages,
      ...validImages.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }))
    ];
    this.syncImageNames();
    input.value = '';
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  removeImage(image: SelectedImage): void {
    URL.revokeObjectURL(image.previewUrl);
    this.selectedImages = this.selectedImages.filter((item) => item.id !== image.id);
    this.syncImageNames();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => this.setCoords(pos.coords.latitude, pos.coords.longitude, true),
      () => { this.message = 'No se pudo obtener tu ubicación actual.'; },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  async submit(): Promise<void> {
    if (this.submitting) {
      return;
    }
    if (!this.isLoggedIn) {
      this.message = 'Inicia sesión como ciudadano para enviar el reporte.';
      return;
    }
    if (!this.detail || !this.direccion) {
      this.message = 'Completa descripción y dirección.';
      return;
    }
    if (!this.selectedImages.length) {
      this.message = 'Adjunta una imagen del problema.';
      return;
    }
    this.submitting = true;
    this.updateSubmitUi('uploading', 'Subiendo evidencia...');

    try {
      console.log('📤 Iniciando envío de reporte');
      console.log('Imágenes:', this.selectedImages.length);

      const archivo = await firstValueFrom(
        this.uploadService.subirReportes(this.selectedImages.map((image) => image.file)).pipe(
          timeout(this.uploadTimeoutMs)
        )
      );

      console.log('✅ Imágenes subidas:', archivo);

      const fotoUrls = archivo.archivos?.map((item) => item.url) ?? [archivo.url];
      if (!fotoUrls.length || !fotoUrls[0]) {
        throw new Error('No se recibió la URL de las imágenes subidas. Backend respuesta: ' + JSON.stringify(archivo));
      }

      const descripcion = `${this.detail.trim()}${this.referencia.trim() ? ` | Referencia: ${this.referencia.trim()}` : ''}`;
      this.updateSubmitUi('saving', 'Evidencia subida. Guardando reporte...');

      const payload = {
        tipo: this.tipo,
        descripcion,
        fotoUrl: fotoUrls[0],
        fotoUrls,
        lat: Number(this.lat.toFixed(7)),
        lng: Number(this.lng.toFixed(7)),
        direccion: this.direccion,
        zona: this.distrito
      };

      console.log('📝 Enviando reporte con payload:', payload);

      const reporte = await firstValueFrom(
        this.reportesService.crear(payload).pipe(
          timeout(this.reportTimeoutMs)
        )
      );

      console.log('✅ Reporte creado exitosamente:', reporte);

      this.updateSubmitUi('success', '');
      this.notifications.showSuccess(
        `Reporte REP-${reporte.id} enviado`,
        `Zona: ${reporte.zona}. Puedes revisar el seguimiento cuando quieras.`
      );
      setTimeout(() => {
        this.detail = '';
        this.referencia = '';
        this.clearSelectedImages();
        this.updateSubmitUi('idle', '');
      }, 2500);

    } catch (error: unknown) {
      const errorMsg = this.submitErrorMessage(error);
      console.error('❌ Error en envío de reporte:', error);
      console.error('Mensaje de error:', errorMsg);
      this.updateSubmitUi('error', errorMsg);
    } finally {
      this.submitting = false;
      if (this.submitState !== 'success' && this.submitState !== 'error') {
        this.updateSubmitUi('idle', this.message);
      }
      this.cdr.detectChanges();
    }
  }

  private updateSubmitUi(state: SubmitState, message?: string): void {
    this.submitState = state;
    if (typeof message === 'string') {
      this.message = message;
    }
    this.cdr.detectChanges();
  }

  private async loadLimaBoundary(): Promise<void> {
    try {
      const res = await fetch('/geo/lima-provincia.geojson');
      if (!res.ok) throw new Error('No se pudo cargar geojson');
      const geojson = await res.json() as GeoJSON.FeatureCollection;
      const feature = geojson.features?.[0] as GeoJSON.Feature | undefined;
      if (!feature?.geometry) throw new Error('GeoJSON inválido');
      this.limaGeometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;

      this.limaLayer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
        interactive: false,
        style: {
          color: '#003366',
          weight: 2,
          fillColor: '#00E5FF',
          fillOpacity: 0.08
        }
      }).addTo(this.map!);

      this.limaLayer.on('click', (e: L.LeafletMouseEvent) => this.setCoords(e.latlng.lat, e.latlng.lng, true));

      const bounds = this.limaLayer.getBounds();
      if (bounds.isValid() && this.map) this.map.fitBounds(bounds.pad(-0.08));
    } catch {
      this.zone.run(() => {
        this.mapMessage = 'No se pudo cargar el límite de Lima. Intenta recargar la página.';
      });
    }
  }

  private isInsideLima(lat: number, lng: number): boolean {
    if (!this.limaGeometry) return true;
    const point: [number, number] = [lng, lat];
    if (this.limaGeometry.type === 'Polygon') {
      return this.pointInPolygon(point, this.limaGeometry.coordinates);
    }
    return this.limaGeometry.coordinates.some((poly) => this.pointInPolygon(point, poly));
  }

  private pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
    const [x, y] = point;
    const [outerRing, ...holes] = polygon;
    if (!this.pointInRing(x, y, outerRing)) return false;
    return !holes.some((hole) => this.pointInRing(x, y, hole));
  }

  private pointInRing(x: number, y: number, ring: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    const requestId = ++this.reverseRequestId;
    try {
      const nominatim = await this.reverseWithNominatim(lat, lng);
      if (requestId !== this.reverseRequestId) return;
      if (nominatim?.addressLine) {
        this.zone.run(() => {
          this.setDireccionValue(nominatim.addressLine);
          if (nominatim.district && this.distritos.includes(nominatim.district)) this.distrito = nominatim.district;
          this.resolvingAddress = false;
        });
        return;
      }

      const fallback = await this.reverseWithBigDataCloud(lat, lng);
      if (requestId !== this.reverseRequestId) return;
      this.zone.run(() => {
        this.setDireccionValue(fallback || `Ubicación aproximada (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        this.mapMessage = fallback ? '' : 'No se pudo resolver una dirección exacta para este punto.';
        this.resolvingAddress = false;
      });
    } catch {
      if (requestId !== this.reverseRequestId) return;
      this.zone.run(() => {
        this.setDireccionValue(`Ubicación aproximada (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        this.mapMessage = 'No se pudo resolver una dirección exacta para este punto.';
        this.resolvingAddress = false;
      });
    }
  }

  private setDireccionValue(value: string): void {
    this.direccion = value;
    const input = this.direccionInput?.nativeElement;
    if (input && input.value !== value) input.value = value;
  }

  private syncImageNames(): void {
    this.imageNames = this.selectedImages.map((image) => image.file.name);
    this.imageName = this.imageNames.join(', ');
    if (this.imageNames.length) {
      this.message = '';
    }
  }

  private clearSelectedImages(): void {
    this.selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    this.selectedImages = [];
    this.imageNames = [];
    this.imageName = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private submitErrorMessage(error: unknown): string {
    console.error('Error object:', error);

    if (error instanceof Error && error.name === 'TimeoutError') {
      if (this.submitState === 'uploading') {
        return '⏱️ La subida de imágenes tardó demasiado (>30s). Revisa conexión o Cloudinary.';
      }
      if (this.submitState === 'saving') {
        return '⏱️ El registro del reporte tardó demasiado (>30s). Revisa backend/API.';
      }
      return '⏱️ La solicitud tardó demasiado. Intenta nuevamente.';
    }

    if (error instanceof Error) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        return '🔐 Sesión expirada o no válida. Inicia sesión nuevamente.';
      }
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return '🚫 No tienes permiso para enviar reportes. Contacta al administrador.';
      }
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        return '❌ El endpoint no existe. El backend puede no estar correctamente configurado.';
      }
      if (error.message?.includes('500') || error.message?.includes('Internal Server')) {
        return '⚠️ Error en el servidor. Intenta más tarde o contacta soporte.';
      }
      if (error.message?.includes('No se recibió')) {
        return `📸 ${error.message}`;
      }
      if (error.message) {
        return `❌ ${error.message}`;
      }
    }

    const apiMsg = apiErrorMessage(error);
    if (apiMsg && apiMsg !== 'Error desconocido') {
      return `❌ ${apiMsg}`;
    }

    return '❌ Error desconocido al enviar el reporte. Revisa la consola del navegador (F12) para más detalles.';
  }

  private async reverseWithNominatim(lat: number, lng: number): Promise<{ addressLine: string; district: string } | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json() as { display_name?: string; address?: Record<string, string> };
    const addr = data.address ?? {};
    const road = addr['road'] || addr['pedestrian'] || addr['path'] || addr['footway'] || '';
    const house = addr['house_number'] ? ` ${addr['house_number']}` : '';
    const district = addr['city_district'] || addr['suburb'] || addr['town'] || addr['city'] || '';
    const composed = `${road}${house}`.trim() || data.display_name || '';
    return composed ? { addressLine: composed, district } : null;
  }

  private async reverseWithBigDataCloud(lat: number, lng: number): Promise<string> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return '';
    const data = await res.json() as Record<string, string>;
    const road = data['locality'] || data['city'] || '';
    const principal = data['principalSubdivision'] || '';
    const country = data['countryName'] || '';
    return [road, principal, country].filter(Boolean).join(', ');
  }
}
