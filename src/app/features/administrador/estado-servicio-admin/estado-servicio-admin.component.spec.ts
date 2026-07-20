import '@angular/compiler';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('bloquea publicacion sin inicio ni fin', () => {
    const component = new EstadoServicioAdminComponent(estadoServicio, cdr);
    component.alertForm.patchValue({
      tipo: 'INFORMATIVA',
      severidad: 'INFO',
      estado: 'ACTIVA',
      titulo: 'Prueba',
      descripcion: 'Prueba'
    });

    component.crearAlerta();

    expect(component.error).toBe('Completa los campos obligatorios antes de publicar.');
    expect(vi.mocked((estadoServicio as any).crearAlerta)).not.toHaveBeenCalled();
  });

  it('muestra arriba la alerta creada despues de publicar', () => {
    const component = new EstadoServicioAdminComponent(estadoServicio, cdr);
    component.alertas = [{
      id: 1,
      tipo: 'INFORMATIVA',
      titulo: 'Alerta anterior',
      descripcion: 'Detalle anterior',
      severidad: 'INFO',
      estado: 'ACTIVA',
      creadoEn: '2026-06-27T00:00:00'
    }];
    component.alertForm.setValue({
      tipo: 'RIESGO_DESABASTECIMIENTO',
      severidad: 'ALTA',
      estado: 'ACTIVA',
      titulo: 'Prueba nueva',
      descripcion: 'Detalle de prueba',
      iniciaEn: '2026-07-20T08:00',
      finalizaEn: '2026-07-20T12:00'
    });
    vi.mocked((estadoServicio as any).crearAlerta).mockReturnValueOnce(of({
      id: 9,
      tipo: 'RIESGO_DESABASTECIMIENTO',
      titulo: 'Prueba nueva',
      descripcion: 'Detalle de prueba',
      severidad: 'ALTA',
      estado: 'ACTIVA',
      iniciaEn: '2026-07-20T08:00:00',
      finalizaEn: '2026-07-20T12:00:00',
      creadoEn: '2026-07-19T19:45:00'
    }));

    component.crearAlerta();

    expect(vi.mocked((estadoServicio as any).crearAlerta)).toHaveBeenCalledWith({
      tipo: 'RIESGO_DESABASTECIMIENTO',
      severidad: 'ALTA',
      estado: 'ACTIVA',
      titulo: 'Prueba nueva',
      descripcion: 'Detalle de prueba',
      iniciaEn: '2026-07-20T08:00',
      finalizaEn: '2026-07-20T12:00'
    });
    expect(component.alertas[0].id).toBe(9);
    expect(component.success).toBe('Alerta publicada correctamente.');
  });
});
