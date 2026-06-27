import { of } from 'rxjs';
import { EstadoServicioService } from '../../../core/api/estado-servicio.service';
import { EstadoServicioAdminComponent } from './estado-servicio-admin.component';

describe('EstadoServicioAdminComponent', () => {
  const estadoServicio = {
    listarAlertas: vi.fn(() => of([])),
    crearAlerta: vi.fn(() => of({
      id: 1,
      tipo: 'INFORMATIVA',
      titulo: 'Alerta',
      descripcion: 'Detalle',
      severidad: 'INFO',
      estado: 'ACTIVA',
      creadoEn: '2026-06-27T00:00:00'
    }))
  } as unknown as EstadoServicioService;

  const cdr = {
    detectChanges: vi.fn()
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloquea publicacion cuando la fecha de fin es anterior al inicio', () => {
    const component = new EstadoServicioAdminComponent(estadoServicio, cdr);
    component.alertForm.setValue({
      tipo: 'CORTE_PROGRAMADO',
      severidad: 'MEDIA',
      estado: 'ACTIVA',
      titulo: 'Corte programado',
      descripcion: 'Corte parcial por mantenimiento.',
      iniciaEn: '2026-06-27T16:00',
      finalizaEn: '2026-06-27T14:00'
    });

    component.crearAlerta();

    expect(component.alertForm.hasError('dateRange')).toBe(true);
    expect(component.error).toBe('La fecha de fin no puede ser anterior al inicio.');
    expect(vi.mocked((estadoServicio as any).crearAlerta)).not.toHaveBeenCalled();
  });
});
