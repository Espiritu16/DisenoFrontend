import '@angular/compiler';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../core/api/dashboard.service';

describe('DashboardComponent', () => {
  const dashboardService = {
    kpis: vi.fn()
  } as unknown as DashboardService;
  const cdr = {
    detectChanges: vi.fn()
  } as any;

  function createComponent() {
    return new DashboardComponent(dashboardService, cdr);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar kpis desde backend', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(of({
      totalReportes: 120,
      reportesPendientes: 11,
      reportesEnProceso: 7,
      reportesResueltos: 20,
      casosAbiertos: 4,
      casosResueltos: 18,
      promedioHorasResolucion: 14.5,
      incrementoEstimadoPorcentaje: 18,
      recomendacionAutomatica: 'Priorizar cuadrillas en Ate.',
      actividadSemanal: [
        { dia: 'Lun', valor: 2 },
        { dia: 'Hoy', valor: 5 }
      ],
      reportesPorMes: [
        { mes: 'Jul', cantidad: 30 },
        { mes: 'Ago', cantidad: 40 }
      ],
      reportesPorCategoria: [
        { categoria: 'Fuga de agua', cantidad: 25 }
      ],
      reportesPorEstado: [
        { estado: 'Pendientes', cantidad: 11 },
        { estado: 'Resueltos', cantidad: 20 }
      ],
      reportesPorZona: [
        { nombre: 'Cercado de Lima', cantidad: 3 }
      ],
      tiemposPorZona: [],
      zonasCriticas: [],
      proyeccionMensual: [
        { mes: 'Oct', estimado: 47 }
      ],
      categoriasConCrecimiento: [
        { categoria: 'Fuga de agua', baseActual: 20, estimadoSiguienteMes: 25, crecimientoPorcentual: 25 }
      ],
      zonasRiesgo: [
        { zona: 'Ate', reportes: 18, nivelRiesgo: 'Alto' }
      ],
      nivelesAgua: []
    }));

    const component = createComponent();
    component.ngOnInit();

    expect((dashboardService as any).kpis).toHaveBeenCalledWith({});
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.kpis.totalReportes).toBe(120);
    expect(component.kpis.casosActivos).toBe(4);
    expect(component.kpis.reportesNuevos).toBe(11);
    expect(component.kpis.casosEnEspera).toBe(7);
    expect(component.kpis.incrementoEstimadoPorcentaje).toBe(18);
    expect(component.actividadSemanal).toHaveLength(2);
    expect(component.reportesPorMes).toHaveLength(2);
    expect(component.reportesPorCategoria[0].categoria).toBe('Fuga de agua');
    expect(component.reportesPorEstado[0].estado).toBe('Pendientes');
    expect(component.proyeccionMensual[0].estimado).toBe(47);
    expect(component.zonasRiesgo[0].nivelRiesgo).toBe('Alto');
    expect(component.reportesPorZona[0].nombre).toBe('Cercado de Lima');
    expect(component.alturaActividad(5)).toBe(100);
    expect(component.anchoZona(3)).toBe(100);
    expect(component.alturaMes(40)).toBe(100);
    expect(component.anchoCategoria(25)).toBe(100);
    expect(component.anchoEstado(11)).toBe(35);
    expect(component.riesgoClass('Alto')).toBe('risk-alto');
  });

  it('debe manejar error de kpis', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'fallo' } }))
    );

    const component = createComponent();
    component.cargarKpis();

    expect(component.loading).toBe(false);
    expect(component.error.length).toBeGreaterThan(0);
  });

  it('debe enviar filtros de mes al recargar indicadores', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(of({
      totalReportes: 3,
      reportesPendientes: 1,
      reportesEnProceso: 0,
      reportesResueltos: 2,
      casosAbiertos: 0,
      casosResueltos: 2,
      promedioHorasResolucion: 8,
      incrementoEstimadoPorcentaje: 0,
      recomendacionAutomatica: '',
      actividadSemanal: [],
      reportesPorMes: [{ mes: 'Sep', cantidad: 3 }],
      reportesPorCategoria: [],
      reportesPorEstado: [],
      reportesPorZona: [],
      tiemposPorZona: [],
      zonasCriticas: [],
      proyeccionMensual: [],
      categoriasConCrecimiento: [],
      zonasRiesgo: [],
      nivelesAgua: []
    }));

    const component = createComponent();
    component.cambiarModo('month');
    component.filtroForm.controls.month.setValue('2026-09');
    component.aplicarFiltros();

    expect((dashboardService as any).kpis).toHaveBeenCalledWith({
      fechaDesde: '2026-09-01',
      fechaHasta: '2026-09-30'
    });
    expect(component.filtroAplicado).toContain('2026');
    expect(component.kpis.totalReportes).toBe(3);
  });
});
