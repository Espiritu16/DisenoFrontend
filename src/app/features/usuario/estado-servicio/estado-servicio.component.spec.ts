import '@angular/compiler';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstadoServicioService } from '../../../core/api/estado-servicio.service';
import { EstadoServicioComponent } from './estado-servicio.component';

describe('EstadoServicioComponent', () => {
  const estadoServicioService = {
    listarAlertas: vi.fn()
  } as unknown as EstadoServicioService;
  const cdr = {
    detectChanges: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta alertas publicas aunque no exista sesion activa', () => {
    vi.mocked((estadoServicioService as any).listarAlertas).mockReturnValue(of([]));
    const component = new EstadoServicioComponent(estadoServicioService, cdr as any);

    component.ngOnInit();

    expect((estadoServicioService as any).listarAlertas).toHaveBeenCalledOnce();
    expect(component.alertasError).toBe('');
    expect(component.totalAlertas).toBe(0);
  });

  it('formatea el inicio y fin de una alerta para mostrarlo al ciudadano', () => {
    const component = new EstadoServicioComponent(estadoServicioService, cdr as any);

    const rango = component.rangoAlerta({
      id: 1,
      tipo: 'CORTE_PROGRAMADO',
      titulo: 'Corte programado',
      descripcion: 'Corte parcial por mantenimiento.',
      severidad: 'MEDIA',
      estado: 'PROGRAMADA',
      iniciaEn: '2026-06-22T14:00:00',
      finalizaEn: '2026-06-22T16:00:00',
      creadoEn: '2026-06-21T09:30:00'
    });

    const normalizado = rango.replace(/\u00a0/g, ' ');
    expect(normalizado).toContain('22 jun. 2026');
    expect(normalizado).toContain('2:00 p. m.');
    expect(normalizado).toContain('4:00 p. m.');
  });
});
