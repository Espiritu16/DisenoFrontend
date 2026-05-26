import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReportesService } from './reportes.service';
import { ApiResponse, ReporteResponse } from './api-models';
import { environment } from '../../../environments/environment';

describe('ReportesService', () => {
  let service: ReportesService;
  let httpMock: HttpTestingController;

  const payload: ReporteResponse[] = [{
    id: 1,
    usuarioId: 10,
    tipo: 'Fuga',
    descripcion: 'Desc',
    fotoUrl: 'https://x/foto.jpg',
    fotoUrls: ['https://x/foto.jpg'],
    lat: -12.1,
    lng: -77.0,
    direccion: 'Av X',
    zona: 'Surco',
    posibleDuplicado: false,
    estado: 'PENDIENTE',
    fechaCreacion: '2026-05-25T00:00:00',
    fechaActualizacion: '2026-05-25T00:00:00'
  }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReportesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe enviar filtros compuestos en query params', () => {
    service.listarTodos({
      usuarioId: 5,
      estado: 'EN_PROCESO',
      tipo: 'Fuga',
      zona: 'Miraflores',
      fechaDesde: '2026-05-20T00:00:00',
      fechaHasta: '2026-05-25T23:59:59'
    }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === `${environment.apiBaseUrl}/reportes`
      && r.params.get('usuarioId') === '5'
      && r.params.get('estado') === 'EN_PROCESO'
      && r.params.get('tipo') === 'Fuga'
      && r.params.get('zona') === 'Miraflores'
      && r.params.get('fechaDesde') === '2026-05-20T00:00:00'
      && r.params.get('fechaHasta') === '2026-05-25T23:59:59'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: payload } as ApiResponse<ReporteResponse[]>);
  });

  it('no debe enviar filtros vacios', () => {
    service.listarTodos({
      tipo: '  ',
      zona: ''
    }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === `${environment.apiBaseUrl}/reportes`
      && !r.params.has('tipo')
      && !r.params.has('zona')
    );
    req.flush({ data: payload } as ApiResponse<ReporteResponse[]>);
  });
});
