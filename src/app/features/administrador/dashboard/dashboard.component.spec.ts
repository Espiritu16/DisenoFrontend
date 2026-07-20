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
      totalCiudadanosReportantes: 42,
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
      usuariosReportantesPorMes: [
        { mes: 'Jul', cantidad: 12 },
        { mes: 'Ago', cantidad: 18 }
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

    expect((dashboardService as any).kpis).toHaveBeenCalledWith({
      fechaDesde: `${component.anioActual}-01-01`,
      fechaHasta: `${component.anioActual}-12-31`
    });
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.kpis.totalReportes).toBe(120);
    expect(component.kpis.casosActivos).toBe(4);
    expect(component.kpis.reportesNuevos).toBe(11);
    expect(component.kpis.casosEnEspera).toBe(7);
    expect(component.kpis.totalCiudadanosReportantes).toBe(42);
    expect(component.kpis.incrementoEstimadoPorcentaje).toBe(18);
    expect(component.actividadSemanal).toHaveLength(2);
    expect(component.reportesPorMes).toHaveLength(2);
    expect(component.usuariosReportantesPorMes).toHaveLength(2);
    expect(component.usuariosReportantesPorMes[0].cantidad).toBe(12);
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

  it('debe alternar entre dashboard descriptivo y predictivo', () => {
    const component = createComponent();

    expect(component.tipoAnalisis).toBe('descriptivo');
    expect(component.tituloDashboard).toBe('Dashboard de Análisis Descriptivo de AquaComunidad');

    component.cambiarTipoAnalisis('predictivo');

    expect(component.tipoAnalisis).toBe('predictivo');
    expect(component.tituloDashboard).toBe('Dashboard de Análisis Predictivo de AquaComunidad');
  });

  it('debe limitar meses disponibles segun el tipo de analisis', () => {
    const component = createComponent();

    expect(component.mesesDisponibles.map((mes) => mes.label)).toEqual(['Junio', 'Julio', 'Agosto', 'Septiembre']);

    component.cambiarTipoAnalisis('predictivo');

    expect(component.mesesDisponibles.map((mes) => mes.label)).toEqual(['Octubre', 'Noviembre', 'Diciembre']);
  });

  it('debe limpiar el mes seleccionado si no pertenece al nuevo tipo de analisis', () => {
    const component = createComponent();
    component.filtroForm.controls.month.setValue('09', { emitEvent: false });

    component.cambiarTipoAnalisis('predictivo');

    expect(component.filtroForm.controls.month.value).toBe('');
  });

  it('debe usar escala de 20 en 20 en graficos mensuales principales', () => {
    const component = createComponent();
    component.reportesPorMes = [{ mes: 'Jul', cantidad: 59 }];
    component.usuariosReportantesPorMes = [{ mes: 'Jul', cantidad: 18 }];

    const reportesChart = (component as any).chartConfig('reportes-mes');
    const usuariosChart = (component as any).chartConfig('usuarios-reportantes-mes');

    expect(reportesChart.options.scales.y.ticks.stepSize).toBe(20);
    expect(reportesChart.options.scales.y.suggestedMax).toBe(120);
    expect(usuariosChart.options.scales.y.ticks.stepSize).toBe(20);
    expect(usuariosChart.options.scales.y.suggestedMax).toBe(120);
  });

  it('debe graficar solo junio a septiembre en analisis descriptivo', () => {
    const component = createComponent();
    component.reportesPorMes = [
      { mes: 'May', cantidad: 4 },
      { mes: 'Jun', cantidad: 2 },
      { mes: 'Jul', cantidad: 59 },
      { mes: 'Ago', cantidad: 31 },
      { mes: 'Sep', cantidad: 30 },
      { mes: 'Oct', cantidad: 10 }
    ];
    component.usuariosReportantesPorMes = [
      { mes: 'May', cantidad: 2 },
      { mes: 'Jun', cantidad: 2 },
      { mes: 'Jul', cantidad: 50 },
      { mes: 'Ago', cantidad: 28 },
      { mes: 'Sep', cantidad: 26 },
      { mes: 'Oct', cantidad: 9 }
    ];

    const reportesChart = (component as any).chartConfig('reportes-mes');
    const tendenciaChart = (component as any).chartConfig('tendencia-reportes');
    const usuariosChart = (component as any).chartConfig('usuarios-reportantes-mes');

    expect(reportesChart.data.labels).toEqual(['Jun', 'Jul', 'Ago', 'Sep']);
    expect(tendenciaChart.data.labels).toEqual(['Jun', 'Jul', 'Ago', 'Sep']);
    expect(usuariosChart.data.labels).toEqual(['Jun', 'Jul', 'Ago', 'Sep']);
  });

  it('debe usar escala de 20 en 20 en tendencia de reportes', () => {
    const component = createComponent();
    component.reportesPorMes = [{ mes: 'Jul', cantidad: 59 }];

    const tendenciaChart = (component as any).chartConfig('tendencia-reportes');

    expect(tendenciaChart.options.scales.y.ticks.stepSize).toBe(20);
    expect(tendenciaChart.options.scales.y.suggestedMax).toBe(120);
  });

  it('debe usar escala de 20 en 20 en graficos predictivos mensuales', () => {
    const component = createComponent();
    component.proyeccionMensual = [{ mes: 'Oct', estimado: 68 }];

    const proyeccionChart = (component as any).chartConfig('proyeccion-reportes');
    const tendenciaProyectadaChart = (component as any).chartConfig('tendencia-proyectada');

    expect(proyeccionChart.options.scales.y.ticks.stepSize).toBe(20);
    expect(proyeccionChart.options.scales.y.suggestedMax).toBe(120);
    expect(tendenciaProyectadaChart.options.scales.y.ticks.stepSize).toBe(20);
    expect(tendenciaProyectadaChart.options.scales.y.suggestedMax).toBe(120);
  });

  it('debe graficar solo octubre a diciembre en analisis predictivo', () => {
    const component = createComponent();
    component.proyeccionMensual = [
      { mes: 'Sep', estimado: 30 },
      { mes: 'Oct', estimado: 32 },
      { mes: 'Nov', estimado: 34 },
      { mes: 'Dic', estimado: 36 },
      { mes: 'Ene', estimado: 38 }
    ];

    const proyeccionChart = (component as any).chartConfig('proyeccion-reportes');
    const tendenciaProyectadaChart = (component as any).chartConfig('tendencia-proyectada');

    expect(proyeccionChart.data.labels).toEqual(['Oct', 'Nov', 'Dic']);
    expect(tendenciaProyectadaChart.data.labels).toEqual(['Oct', 'Nov', 'Dic']);
  });

  it('debe proyectar estados sobre el total futuro sin comparar con historico', () => {
    const component = createComponent();
    component.proyeccionMensual = [
      { mes: 'Oct', estimado: 34 },
      { mes: 'Nov', estimado: 38 },
      { mes: 'Dic', estimado: 42 }
    ];
    component.reportesPorEstado = [
      { estado: 'Pendientes', cantidad: 30 },
      { estado: 'En proceso', cantidad: 20 },
      { estado: 'Resueltos', cantidad: 50 },
      { estado: 'Duplicados', cantidad: 10 }
    ];

    const estadosProyectadosChart = (component as any).chartConfig('estados-proyectados');
    const comparacionChart = (component as any).chartConfig('historico-vs-proyectado');

    expect(estadosProyectadosChart.data.labels).toEqual(['Pendientes', 'En proceso', 'Resueltos']);
    expect(estadosProyectadosChart.data.datasets[0].data.reduce((total: number, value: number) => total + value, 0))
      .toBe(114);
    expect(comparacionChart).toBeNull();
  });

  it('debe usar escala de 5 en 5 hasta 50 en reportes por zona', () => {
    const component = createComponent();
    component.reportesPorZona = [{ nombre: 'Ate', cantidad: 14 }];

    const zonasChart = (component as any).chartConfig('reportes-zona');

    expect(zonasChart.options.scales.x.ticks.stepSize).toBe(5);
    expect(zonasChart.options.scales.x.suggestedMax).toBe(50);
  });

  it('debe usar escala de 5 en 5 hasta 50 en zonas de riesgo predictivas', () => {
    const component = createComponent();
    component.zonasRiesgo = [{ zona: 'Ate', reportes: 18, nivelRiesgo: 'Alto' }];

    const zonasRiesgoChart = (component as any).chartConfig('riesgo-zonas');

    expect(zonasRiesgoChart.options.scales.x.ticks.stepSize).toBe(5);
    expect(zonasRiesgoChart.options.scales.x.suggestedMax).toBe(50);
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

  it('debe aplicar filtros de mes automaticamente', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(of({
      totalReportes: 3,
      reportesPendientes: 1,
      reportesEnProceso: 0,
      reportesResueltos: 2,
      totalCiudadanosReportantes: 2,
      casosAbiertos: 0,
      casosResueltos: 2,
      promedioHorasResolucion: 8,
      incrementoEstimadoPorcentaje: 0,
      recomendacionAutomatica: '',
      actividadSemanal: [],
      reportesPorMes: [{ mes: 'Sep', cantidad: 3 }],
      usuariosReportantesPorMes: [{ mes: 'Sep', cantidad: 2 }],
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
    component.ngOnInit();
    vi.mocked((dashboardService as any).kpis).mockClear();

    component.filtroForm.controls.year.setValue(component.anioActual);
    component.filtroForm.controls.month.setValue('09');

    expect((dashboardService as any).kpis).toHaveBeenCalledWith({
      fechaDesde: `${component.anioActual}-09-01`,
      fechaHasta: `${component.anioActual}-09-30`
    });
    expect(component.filtroAplicado).toContain(component.anioActual);
    expect(component.kpis.totalReportes).toBe(3);
  });
});
