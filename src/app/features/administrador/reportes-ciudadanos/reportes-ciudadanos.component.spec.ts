import { of, throwError } from 'rxjs';
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

  function createComponent() {
    return new ReportesCiudadanosComponent(reportesService, casosService, usuariosService);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar y mapear reportes desde backend', () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([]));
    vi.mocked((reportesService as any).listarTodos).mockReturnValue(of([{
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
    }]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.reportes.length).toBe(1);
    expect(component.selectedReporte?.id).toBe(2);
    expect(component.empty).toBe(false);
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
