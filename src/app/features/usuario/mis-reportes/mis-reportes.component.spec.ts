import '@angular/compiler';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MisReportesComponent } from './mis-reportes.component';
import { ReportesService } from '../../../core/api/reportes.service';
import { ReporteResponse } from '../../../core/api/api-models';

describe('MisReportesComponent', () => {
  const reportesService = {
    listarMisReportes: vi.fn(),
    trazabilidad: vi.fn()
  } as unknown as ReportesService;

  const cdr = {
    detectChanges: vi.fn()
  };

  const reporteBase: ReporteResponse = {
    id: 207956,
    usuarioId: 140,
    tipo: 'Fuga de Agua',
    descripcion: 'Fuga reportada',
    fotoUrl: '/uploads/reportes/fuga.webp',
    fotoUrls: ['/uploads/reportes/fuga.webp'],
    lat: -12,
    lng: -77,
    direccion: 'Av X',
    zona: 'Ate',
    posibleDuplicado: false,
    estado: 'PENDIENTE',
    fechaCreacion: '2026-07-19T21:51:48',
    fechaActualizacion: '2026-07-19T21:51:48'
  };

  function createComponent() {
    return new MisReportesComponent(reportesService, cdr as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked((reportesService as any).trazabilidad).mockReturnValue(of({
      reporteId: reporteBase.id,
      historialReporte: [],
      historialCaso: []
    }));
  });

  it('carga reportes y selecciona el mas reciente', () => {
    vi.mocked((reportesService as any).listarMisReportes).mockReturnValue(of([reporteBase]));
    const component = createComponent();

    component.ngOnInit();

    expect(component.reports).toHaveLength(1);
    expect(component.selectedReport?.id).toBe(207956);
    expect(component.consultedCode).toBe('REP-207956');
    expect((reportesService as any).trazabilidad).toHaveBeenCalledWith(207956);
  });

  it('muestra el codigo consultado y selecciona el reporte encontrado', () => {
    const component = createComponent();
    component.reports = [reporteBase];
    component.queryCode = 'REP-207956';

    component.consultReport();

    expect(component.consultedCode).toBe('REP-207956');
    expect(component.selectedReport?.id).toBe(207956);
  });

  it('consolida trazabilidad de reporte y caso para evitar eventos operativos duplicados', () => {
    const component = createComponent();
    component.trazabilidad = {
      reporteId: 134,
      casoId: 133,
      historialReporte: [
        {
          tipo: 'REPORTE',
          estadoNuevo: 'PENDIENTE',
          observacion: 'Creacion de reporte',
          cambiadoPor: 140,
          fechaCambio: '2026-07-19T21:51:48'
        },
        {
          tipo: 'REPORTE',
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: 'EN_PROCESO',
          observacion: 'Derivado a caso operativo',
          cambiadoPor: 4,
          fechaCambio: '2026-07-19T21:52:43'
        },
        {
          tipo: 'REPORTE',
          estadoAnterior: 'EN_PROCESO',
          estadoNuevo: 'ESCALADO',
          observacion: '',
          cambiadoPor: 4,
          fechaCambio: '2026-07-19T21:53:12'
        }
      ],
      historialCaso: [
        {
          tipo: 'CASO',
          estadoNuevo: 'EN_PROCESO',
          observacion: 'Creacion de caso operativo',
          cambiadoPor: 4,
          fechaCambio: '2026-07-19T21:52:43'
        },
        {
          tipo: 'CASO',
          estadoAnterior: 'EN_PROCESO',
          estadoNuevo: 'ESCALADO',
          observacion: '',
          cambiadoPor: 4,
          fechaCambio: '2026-07-19T21:53:12'
        }
      ]
    };

    const historial = component.historialCompleto();

    expect(historial).toHaveLength(3);
    expect(historial.map((item) => item.tipo)).toEqual(['CASO', 'CASO', 'REPORTE']);
    expect(historial.some((item) => item.tipo === 'REPORTE' && item.estadoAnterior === 'EN_PROCESO')).toBe(false);
  });
});
