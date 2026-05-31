import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { firstValueFrom, timeout } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AuthService } from '../../../core/api/auth.service';
import { ReportesService } from '../../../core/api/reportes.service';
import { UploadService } from '../../../core/api/upload.service';
import { AquaFooterComponent } from '../../../shared/public/aqua-footer/aqua-footer.component';
import { AquaHeaderComponent } from '../../../shared/public/aqua-header/aqua-header.component';

interface IncidentType {
  label: string;
  value: string;
  helper: string;
}

interface EvidenceImage {
  id: string;
  name: string;
  sizeLabel: string;
  previewUrl: string;
  file: File;
}

type ReportStep = 'form' | 'summary' | 'sent';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule, AquaHeaderComponent, AquaFooterComponent],
  templateUrl: './reportar.component.html',
  styleUrl: './reportar.component.css'
})
export class ReportarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('districtMenu') districtMenu?: ElementRef<HTMLElement>;
  @ViewChild('reportWorkspace') reportWorkspace?: ElementRef<HTMLElement>;
  @ViewChild('direccionInput') direccionInput?: ElementRef<HTMLInputElement>;
  @ViewChild('mapPanel') mapPanel?: ElementRef<HTMLElement>;

  distrito = '';
  tipo = 'Fuga';
  direccion = '';
  referencia = '';
  descripcion = '';
  lat = -12.0464;
  lng = -77.0428;
  mapMessage = '';
  resolvingAddress = false;
  districtDropdownOpen = false;
  reportStep: ReportStep = 'form';
  evidenceImages: EvidenceImage[] = [];
  previewImage?: EvidenceImage;
  submittedCode = '';
  submitting = false;
  submitMessage = '';

  readonly distritos = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'Cercado de Lima',
    'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho (Chosica)',
    'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
    'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
    'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];

  readonly incidentTypes: IncidentType[] = [
    { label: 'Fuga', value: 'Fuga', helper: 'Pérdida visible de agua' },
    { label: 'Baja presión', value: 'Baja presión', helper: 'Servicio débil o irregular' },
    { label: 'Agua turbia', value: 'Agua turbia', helper: 'Color, olor o sedimentos' },
    { label: 'Corte', value: 'Corte inesperado', helper: 'Interrupción no programada' }
  ];

  private map?: L.Map;
  private marker?: L.Marker;
  private limaLayer?: L.GeoJSON;
  private limaGeometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  private lastValid = { lat: this.lat, lng: this.lng };
  private reverseRequestId = 0;
  private scrollTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly mapId = 'report-map';

  private readonly handleDocumentWheel = (event: WheelEvent): void => {
    if (!this.districtDropdownOpen || !this.districtMenu?.nativeElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.districtMenu.nativeElement.scrollTop += event.deltaY;
  };

  private readonly handleMapPanelWheel = (event: WheelEvent): void => {
    this.lockMapPanelScroll(event);
  };

  constructor(
    private zone: NgZone,
    private auth: AuthService,
    private uploadService: UploadService,
    private reportesService: ReportesService,
    private cdr: ChangeDetectorRef
  ) {
    document.addEventListener('wheel', this.handleDocumentWheel, {
      capture: true,
      passive: false
    });
  }

  ngAfterViewInit(): void {
    this.mapPanel?.nativeElement.addEventListener('wheel', this.handleMapPanelWheel, {
      passive: false
    });

    if (this.shouldSkipMapInit()) {
      return;
    }

    this.initMap();
  }

  ngOnDestroy(): void {
    document.removeEventListener('wheel', this.handleDocumentWheel, {
      capture: true
    });
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    this.mapPanel?.nativeElement.removeEventListener('wheel', this.handleMapPanelWheel);
    this.revokeEvidenceUrls();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  @HostListener('document:click')
  closeDistrictDropdown(): void {
    this.districtDropdownOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeDistrictDropdownWithEscape(): void {
    this.districtDropdownOpen = false;
  }

  toggleDistrictDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.districtDropdownOpen = !this.districtDropdownOpen;
  }

  selectDistrict(district: string, event: MouseEvent): void {
    event.stopPropagation();
    this.distrito = district;
    this.districtDropdownOpen = false;
  }

  focusReportWorkspace(): void {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }

    this.scrollTimeoutId = setTimeout(() => {
      const workspace = this.reportWorkspace?.nativeElement;
      if (typeof workspace?.scrollIntoView !== 'function') {
        return;
      }

      workspace.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }

  onEvidenceChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));

    if (!files.length) {
      return;
    }

    this.evidenceImages = [
      ...this.evidenceImages,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        sizeLabel: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        previewUrl: URL.createObjectURL(file),
        file
      }))
    ];
    input.value = '';
  }

  openEvidencePreview(image: EvidenceImage): void {
    this.previewImage = image;
  }

  closeEvidencePreview(): void {
    this.previewImage = undefined;
  }

  goToSummary(): void {
    this.submitMessage = this.validateForm();
    if (this.submitMessage) {
      this.focusReportWorkspace();
      return;
    }
    this.reportStep = 'summary';
    this.focusReportWorkspace();
  }

  goBackToForm(): void {
    this.reportStep = 'form';
    this.focusReportWorkspace();
  }

  async sendReport(): Promise<void> {
    if (this.submitting) {
      return;
    }

    if (!this.auth.token) {
      this.submitMessage = 'Inicia sesión para enviar el reporte y hacer seguimiento.';
      this.focusReportWorkspace();
      return;
    }

    this.submitMessage = this.validateForm();
    if (this.submitMessage) {
      this.reportStep = 'form';
      this.focusReportWorkspace();
      return;
    }

    this.submitting = true;
    this.submitMessage = 'Subiendo evidencia...';
    try {
      const archivo = await firstValueFrom(
        this.uploadService.subirReportes(this.evidenceImages.map((image) => image.file)).pipe(timeout(20000))
      );
      const fotoUrls = archivo.archivos?.map((item) => item.url).filter(Boolean) ?? [archivo.url].filter(Boolean);
      if (!fotoUrls.length) {
        throw new Error('No se recibieron URLs de evidencia desde el servidor.');
      }

      this.submitMessage = 'Guardando reporte...';
      const descripcion = `${this.descripcion.trim()}${this.referencia.trim() ? ` | Referencia: ${this.referencia.trim()}` : ''}`;
      const reporte = await firstValueFrom(
        this.reportesService.crear({
          tipo: this.tipo,
          descripcion,
          fotoUrl: fotoUrls[0],
          fotoUrls,
          lat: Number(this.lat.toFixed(7)),
          lng: Number(this.lng.toFixed(7)),
          direccion: this.direccion.trim(),
          zona: this.distrito.trim()
        }).pipe(timeout(20000))
      );

      this.submittedCode = `REP-${reporte.id}`;
      this.submitMessage = '';
      this.reportStep = 'sent';
      this.scheduleDetectChanges();
      this.focusReportWorkspace();
    } catch (error: unknown) {
      this.submitMessage = apiErrorMessage(error);
      this.scheduleDetectChanges();
      this.focusReportWorkspace();
    } finally {
      this.submitting = false;
      this.scheduleDetectChanges();
    }
  }

  resetReport(): void {
    this.distrito = '';
    this.tipo = 'Fuga';
    this.direccion = '';
    this.referencia = '';
    this.descripcion = '';
    this.mapMessage = '';
    this.submitMessage = '';
    this.submittedCode = '';
    this.reportStep = 'form';
    this.revokeEvidenceUrls();
    this.evidenceImages = [];
    this.focusReportWorkspace();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.mapMessage = 'Tu navegador no permite obtener ubicación.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.setCoords(position.coords.latitude, position.coords.longitude, true),
      () => {
        this.zone.run(() => {
          this.mapMessage = 'No se pudo obtener tu ubicación actual.';
        });
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  private lockMapPanelScroll(event: WheelEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private validateForm(): string {
    if (!this.distrito.trim()) {
      return 'Selecciona el distrito donde ocurre la incidencia.';
    }
    if (!this.direccion.trim()) {
      return 'Selecciona el punto exacto en el mapa.';
    }
    if (!this.descripcion.trim()) {
      return 'Describe brevemente el problema observado.';
    }
    if (!this.evidenceImages.length) {
      return 'Adjunta al menos una foto de evidencia.';
    }
    return '';
  }

  private scheduleDetectChanges(): void {
    queueMicrotask(() => this.cdr.detectChanges());
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

    const icon = L.divIcon({
      className: 'report-pin-wrap',
      html: '<span class="report-pin"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    this.marker = L.marker([this.lat, this.lng], { draggable: true, icon }).addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => this.setCoords(event.latlng.lat, event.latlng.lng, true));
    this.map.on('dblclick', (event: L.LeafletMouseEvent) => this.setCoords(event.latlng.lat, event.latlng.lng, true));
    this.marker.on('dragend', () => {
      const point = this.marker?.getLatLng();
      if (point) this.setCoords(point.lat, point.lng, false);
    });

    void this.loadLimaBoundary();
    setTimeout(() => this.map?.invalidateSize(), 140);
  }

  private setCoords(lat: number, lng: number, recenter: boolean): void {
    this.zone.run(() => {
      if (!this.isInsideLima(lat, lng)) {
        this.mapMessage = 'La ubicación debe estar dentro de la Provincia de Lima.';
        this.lat = Number(this.lastValid.lat.toFixed(6));
        this.lng = Number(this.lastValid.lng.toFixed(6));
        this.marker?.setLatLng([this.lat, this.lng]);
        this.map?.panTo([this.lat, this.lng], { animate: true });
        return;
      }

      this.mapMessage = '';
      this.lat = Number(lat.toFixed(6));
      this.lng = Number(lng.toFixed(6));
      this.lastValid = { lat: this.lat, lng: this.lng };
      this.setDireccionValue(`Ubicación seleccionada (${this.lat.toFixed(6)}, ${this.lng.toFixed(6)})`);
      this.marker?.setLatLng([this.lat, this.lng]);
      if (recenter) this.map?.panTo([this.lat, this.lng], { animate: true });
      this.resolvingAddress = true;
      void this.reverseGeocode(this.lat, this.lng);
    });
  }

  private async loadLimaBoundary(): Promise<void> {
    try {
      const response = await fetch('/geo/lima-provincia.geojson');
      if (!response.ok) throw new Error('No se pudo cargar geojson');
      const geojson = await response.json() as GeoJSON.FeatureCollection;
      const feature = geojson.features?.[0] as GeoJSON.Feature | undefined;
      if (!feature?.geometry || !this.map) throw new Error('GeoJSON inválido');

      this.limaGeometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
      this.limaLayer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
        interactive: false,
        style: {
          color: '#2563eb',
          weight: 2,
          fillColor: '#60a5fa',
          fillOpacity: 0.08
        }
      }).addTo(this.map);

      const bounds = this.limaLayer.getBounds();
      if (bounds.isValid()) this.map.fitBounds(bounds.pad(-0.08));
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
    return this.limaGeometry.coordinates.some((polygon) => this.pointInPolygon(point, polygon));
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
      const result = await this.reverseWithNominatim(lat, lng);
      if (requestId !== this.reverseRequestId) return;

      this.zone.run(() => {
        this.setDireccionValue(result.addressLine || `Ubicación aproximada (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
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

  private async reverseWithNominatim(lat: number, lng: number): Promise<{ addressLine: string; district: string }> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return { addressLine: '', district: '' };

    const data = await response.json() as { display_name?: string; address?: Record<string, string> };
    const address = data.address ?? {};
    const road = address['road'] || address['pedestrian'] || address['path'] || address['footway'] || '';
    const house = address['house_number'] ? ` ${address['house_number']}` : '';
    const district = address['city_district'] || address['suburb'] || address['town'] || address['city'] || '';
    const addressLine = `${road}${house}`.trim() || data.display_name || '';
    return { addressLine, district };
  }

  private shouldSkipMapInit(): boolean {
    return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom');
  }

  private revokeEvidenceUrls(): void {
    this.evidenceImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }
}
