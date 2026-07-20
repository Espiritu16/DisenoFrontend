import '@angular/compiler';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CasosService } from '../../../core/api/casos.service';
import { UploadService } from '../../../core/api/upload.service';
import { AtencionCasosComponent } from './atencion-casos.component';

describe('AtencionCasosComponent', () => {
  const casosService = {
    listar: vi.fn(),
    actualizarEstado: vi.fn()
  } as unknown as CasosService;
  const uploadService = {
    subirCasos: vi.fn()
  } as unknown as UploadService;
  const cdr = {
    detectChanges: vi.fn()
  };

  function createComponent(): AtencionCasosComponent {
    return new AtencionCasosComponent(casosService, uploadService, cdr as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ordena casos por la fecha del reporte origen mas reciente', () => {
    vi.mocked((casosService as any).listar).mockReturnValue(of([
      caso(4, '2026-07-01T10:00:00', 'San Miguel', 'Fuga de Agua'),
      caso(8, '2026-09-15T10:00:00', 'Ate', 'Baja presión')
    ]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.casos.map((item) => item.id)).toEqual([8, 4]);
    expect(component.selectedCaso?.id).toBe(8);
  });

  it('filtra directamente por busqueda, estado y mes', () => {
    vi.mocked((casosService as any).listar).mockReturnValue(of([
      caso(4, '2026-07-01T10:00:00', 'San Miguel', 'Fuga de Agua'),
      caso(8, '2026-09-15T10:00:00', 'Ate', 'Baja presión')
    ]));

    const component = createComponent();
    component.ngOnInit();
    component.searchTerm = 'ate';
    component.estadoFilter = 'EN_PROCESO';
    component.mesFilter = '2026-09';
    component.onFiltrosChange();

    expect(component.casosFiltrados.map((item) => item.id)).toEqual([8]);
    expect(component.selectedCaso?.id).toBe(8);
  });

  it('formatea fecha de reporte con anio completo y hora', () => {
    const component = createComponent();

    const fecha = component.formatFecha('2026-09-15T10:00:00');

    expect(fecha).toContain('/2026');
    expect(fecha).toContain('10:00');
  });

  it('permite guardar estado resuelto sin adjuntar evidencia', () => {
    vi.mocked((casosService as any).listar).mockReturnValue(of([caso(8, '2026-09-15T10:00:00', 'Ate', 'Baja presión')]));
    vi.mocked((casosService as any).actualizarEstado).mockReturnValue(of({
      ...caso(8, '2026-09-15T10:00:00', 'Ate', 'Baja presión'),
      estado: 'RESUELTO'
    }));

    const component = createComponent();
    component.ngOnInit();
    component.estado = 'RESUELTO';
    component.observaciones = 'Atendido por equipo tecnico.';

    component.onGuardarCambios();

    expect((casosService as any).actualizarEstado).toHaveBeenCalledWith(
      8,
      'RESUELTO',
      'Atendido por equipo tecnico.',
      undefined,
      []
    );
    expect(component.message).toBe('Caso #8 actualizado.');
  });

  function caso(id: number, reporteFechaCreacion: string, reporteZona: string, reporteTipo: string) {
    return {
      id,
      reporteId: id + 100,
      reporteTipo,
      reporteZona,
      reporteDescripcion: `${reporteTipo} en ${reporteZona}`,
      reporteFechaCreacion,
      responsableId: 7,
      prioridad: id === 8 ? 'ALTA' as const : 'MEDIA' as const,
      estado: 'EN_PROCESO' as const,
      observaciones: '',
      evidenciaCierre: '',
      evidenciaCierreUrls: [],
      fechaAsignacion: '2026-06-01T10:00:00'
    };
  }
});
