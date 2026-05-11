import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-reportar-incidencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reportar-incidencia.component.html',
  styleUrl: './reportar-incidencia.component.css'
})
export class ReportarIncidenciaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('direccionInput') direccionInput?: ElementRef<HTMLInputElement>;

  distrito = 'Cercado de Lima';
  tipo = 'Fuga';
  detail = '';
  direccion = '';
  referencia = '';
  imageName = '';

  lat = -12.0464;
  lng = -77.0428;
  message = '';
  mapMessage = '';
  resolvingAddress = false;

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

  constructor(private mock: MockDataService, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
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
    const file = input.files?.[0];
    this.imageName = file ? file.name : '';
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => this.setCoords(pos.coords.latitude, pos.coords.longitude, true),
      () => { this.message = 'No se pudo obtener tu ubicación actual.'; },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  submit(): void {
    if (!this.detail || !this.direccion) {
      this.message = 'Completa descripción y dirección.';
      return;
    }
    if (!this.imageName) {
      this.message = 'Adjunta una imagen del problema.';
      return;
    }

    const payload = `${this.detail} | dir:${this.direccion} | ref:${this.referencia || '-'} | img:${this.imageName} | lat:${this.lat.toFixed(6)} lng:${this.lng.toFixed(6)}`;
    const rep = this.mock.addReporte(this.distrito, this.tipo, payload);
    this.message = `Reporte ${rep.id} registrado para ${this.distrito}. Ubicación guardada.`;
    this.detail = '';
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
