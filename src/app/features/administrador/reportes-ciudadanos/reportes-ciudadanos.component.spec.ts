import '@angular/compiler';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportesCiudadanosComponent } from './reportes-ciudadanos.component';
import { ReportesService } from '../../../core/api/reportes.service';
import { CasosService } from '../../../core/api/casos.service';
import { UsuariosService } from '../../../core/api/usuarios.service';

describe('ReportesCiudadanosComponent', () => {
  const reportesService = {
    listarTodos: vi.fn()
  } as unknown as ReportesService;

  const casosService = {
    crear: vi.fn()
  } as unknown as CasosService;

  const usuariosService = {
    listar: vi.fn()
  } as unknown as UsuariosService;

  const cdr = {
    detectChanges: vi.fn()
  };

  function createComponent() {
    return new ReportesCiudadanosComponent(reportesService, casosService, usuariosService, cdr as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar y ordenar reportes recientes desde backend', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([
      {
        id: 2,
        usuarioId: 9,
        tipo: 'Fuga',
        descripcion: 'Rotura',
        fotoUrl: 'https://x/f.jpg',
        fotoUrls: [],
        lat: -12,
        lng: -77,
        direccion: 'Av X',
        zona: 'Surco',
        posibleDuplicado: false,
        estado: 'PENDIENTE',
        fechaCreacion: '2026-05-25T10:00:00',
        fechaActualizacion: '2026-05-25T10:00:00'
      },
      {
        id: 3,
        usuarioId: 10,
        tipo: 'Corte',
        descripcion: 'Corte',
        fotoUrl: 'https://x/c.jpg',
        fotoUrls: [],
        lat: -12,
        lng: -77,
        direccion: 'Av Y',
        zona: 'Ate',
        posibleDuplicado: false,
        estado: 'PENDIENTE',
        fechaCreacion: '2026-05-26T10:00:00',
        fechaActualizacion: '2026-05-26T10:00:00'
      }
    ]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.reportes.length).toBe(2);
    expect(component.reportes[0].id).toBe(3);
    expect(component.selectedReporte?.id).toBe(3);
    expect(component.empty).toBe(false);
  });

  it('debe filtrar reportes directamente por mes tipo y zona', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([
      {
        id: 2,
        usuarioId: 9,
        tipo: 'Fuga de Agua',
        descripcion: 'Rotura',
        fotoUrl: '',
        fotoUrls: [],
        lat: -12,
        lng: -77,
        direccion: 'Av X',
        zona: 'San Miguel',
        posibleDuplicado: false,
        estado: 'PENDIENTE',
        fechaCreacion: '2026-07-25T10:00:00',
        fechaActualizacion: '2026-07-25T10:00:00'
      },
      {
        id: 3,
        usuarioId: 10,
        tipo: 'Baja presión',
        descripcion: 'Presión baja',
        fotoUrl: '',
        fotoUrls: [],
        lat: -12,
        lng: -77,
        direccion: 'Av Y',
        zona: 'Ate',
        posibleDuplicado: false,
        estado: 'PENDIENTE',
        fechaCreacion: '2026-09-26T10:00:00',
        fechaActualizacion: '2026-09-26T10:00:00'
      }
    ]));

    const component = createComponent();
    component.ngOnInit();
    component.tipoFilter = 'baja';
    component.zonaFilter = 'ate';
    component.mesFilter = '2026-09';
    component.onFiltrosChange();

    expect(component.reportesFiltrados.map((reporte) => reporte.id)).toEqual([3]);
    expect(component.selectedReporte?.id).toBe(3);
  });

  it('debe mostrar fechas con dia mes anio completo y hora', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([{
      id: 5,
      usuarioId: 9,
      tipo: 'Fuga',
      descripcion: 'Rotura',
      fotoUrl: '',
      fotoUrls: [],
      lat: -12,
      lng: -77,
      direccion: 'Av X',
      zona: 'Surco',
      posibleDuplicado: false,
      estado: 'PENDIENTE',
      fechaCreacion: '2026-05-25T10:00:00',
      fechaActualizacion: '2026-05-25T10:00:00'
    }]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.reportes[0].fecha).toContain('/2026');
    expect(component.reportes[0].fecha).toContain('10:00');
  });

  it('debe conservar todas las evidencias fotograficas del reporte', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([{
      id: 6,
      usuarioId: 9,
      tipo: 'Fuga de Agua',
      descripcion: 'Rotura',
      fotoUrl: '/uploads/reportes/a.webp',
      fotoUrls: ['/uploads/reportes/a.webp', '/uploads/reportes/b.webp'],
      lat: -12,
      lng: -77,
      direccion: 'Av X',
      zona: 'Surco',
      posibleDuplicado: false,
      estado: 'PENDIENTE',
      fechaCreacion: '2026-05-25T10:00:00',
      fechaActualizacion: '2026-05-25T10:00:00'
    }]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.selectedReporte?.evidencia).toBe('/uploads/reportes/a.webp');
    expect(component.selectedReporte?.evidenciaUrls).toEqual([
      '/uploads/reportes/a.webp',
      '/uploads/reportes/b.webp'
    ]);
  });

  it('debe mostrar estado vacio cuando no hay resultados', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([]));
    const component = createComponent();

    component.loadReportes();

    expect(component.empty).toBe(true);
    expect(component.selectedReporte).toBeNull();
  });

  it('debe mostrar error cuando falla el backend', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(throwError(() => ({ status: 500, error: { message: 'Error' } })));
    const component = createComponent();

    component.loadReportes();

    expect(component.error.length).toBeGreaterThan(0);
    expect(component.loading).toBe(false);
  });

  it('debe derivar caso con responsable y prioridad', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([{ id: 50, rol: 'OPERADOR', estado: 'ACTIVO', nombre: 'Op', correo: 'op@x.com' }]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([{
      id: 10,
      usuarioId: 9,
      tipo: 'Fuga',
      descripcion: 'Rotura',
      fotoUrl: 'https://x/f.jpg',
      fotoUrls: [],
      lat: -12,
      lng: -77,
      direccion: 'Av X',
      zona: 'Surco',
      posibleDuplicado: false,
      estado: 'PENDIENTE',
      fechaCreacion: '2026-05-25T10:00:00',
      fechaActualizacion: '2026-05-25T10:00:00'
    }]));
    vi.mocked((casosService as any).crear).mockReturnValue(of({ id: 77 }));

    const component = createComponent();
    component.ngOnInit();
    component.responsableId = 50;
    component.prioridad = 'ALTA';

    component.onDerivar();

    expect((casosService as any).crear).toHaveBeenCalledWith(10, 50, 'ALTA');
    expect(component.submitting).toBe(false);
    expect(component.mostrarDerivar).toBe(false);
  });
});
