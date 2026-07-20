import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardFiltros, DashboardService } from '../../../core/api/dashboard.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import {
  ActividadSemanalItem,
  CategoriaCrecimientoItem,
  NivelAguaResponse,
  ProyeccionMensualItem,
  ReportePorCategoriaItem,
  ReportePorEstadoItem,
  ReportePorMesItem,
  ReportePorZonaItem,
  TendenciaZonaItem,
  TiempoAtencionPorZonaItem,
  UsuarioReportantePorMesItem,
  ZonaRiesgoItem
} from '../../../core/api/api-models';

Chart.register(...registerables, ChartDataLabels);

type TipoAnalisis = 'descriptivo' | 'predictivo';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('dashboardChart') private chartCanvases?: QueryList<ElementRef<HTMLCanvasElement>>;
  private readonly mesesDescriptivos = new Set(['Jun', 'Jul', 'Ago', 'Sep']);
  private readonly mesesPredictivos = new Set(['Oct', 'Nov', 'Dic']);

  loading = false;
  error = '';
  tipoAnalisis: TipoAnalisis = 'descriptivo';

  kpis = {
    totalReportes: 0,
    casosActivos: 0,
    reportesNuevos: 0,
    casosEnEspera: 0,
    casosPorAsignar: 0,
    casosResueltos: 0,
    reportesResueltos: 0,
    totalCiudadanosReportantes: 0,
    promedioHorasResolucion: 0,
    incrementoEstimadoPorcentaje: 0,
    recomendacionAutomatica: ''
  };

  actividadSemanal: ActividadSemanalItem[] = [];
  reportesPorMes: ReportePorMesItem[] = [];
  usuariosReportantesPorMes: UsuarioReportantePorMesItem[] = [];
  reportesPorCategoria: ReportePorCategoriaItem[] = [];
  reportesPorEstado: ReportePorEstadoItem[] = [];
  reportesPorZona: ReportePorZonaItem[] = [];
  tiemposPorZona: TiempoAtencionPorZonaItem[] = [];
  zonasCriticas: TendenciaZonaItem[] = [];
  proyeccionMensual: ProyeccionMensualItem[] = [];
  categoriasConCrecimiento: CategoriaCrecimientoItem[] = [];
  zonasRiesgo: ZonaRiesgoItem[] = [];
  nivelesAgua: NivelAguaResponse[] = [];
  readonly anioActual = String(new Date().getFullYear());
  filtroAplicado = this.anioActual;
  readonly aniosDisponibles = [this.anioActual];
  private readonly todosLosMeses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];
  filtroForm = new FormGroup({
    year: new FormControl(this.anioActual, { nonNullable: true }),
    month: new FormControl('', { nonNullable: true }),
    day: new FormControl('', { nonNullable: true })
  });
  private readonly charts = new Map<string, Chart>();
  private chartCanvasChanges?: Subscription;
  private viewReady = false;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  get tituloDashboard(): string {
    return this.tipoAnalisis === 'predictivo'
      ? 'Dashboard de Análisis Predictivo de AquaComunidad'
      : 'Dashboard de Análisis Descriptivo de AquaComunidad';
  }

  ngOnInit(): void {
    this.configurarFiltrosAutomaticos();
    this.cargarKpis();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.chartCanvasChanges = this.chartCanvases?.changes.subscribe(() => this.renderChartsWhenReady());
    this.renderChartsWhenReady();
  }

  ngOnDestroy(): void {
    this.chartCanvasChanges?.unsubscribe();
    this.destroyCharts();
  }

  cargarKpis(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.kpis(this.filtrosActuales()).subscribe({
      next: (kpi) => {
        this.kpis = {
          totalReportes: kpi.totalReportes ?? 0,
          casosActivos: kpi.casosAbiertos,
          reportesNuevos: kpi.reportesPendientes,
          casosEnEspera: kpi.reportesEnProceso,
          casosPorAsignar: kpi.reportesPendientes,
          casosResueltos: kpi.casosResueltos,
          reportesResueltos: kpi.reportesResueltos,
          totalCiudadanosReportantes: kpi.totalCiudadanosReportantes ?? 0,
          promedioHorasResolucion: kpi.promedioHorasResolucion,
          incrementoEstimadoPorcentaje: kpi.incrementoEstimadoPorcentaje ?? 0,
          recomendacionAutomatica: kpi.recomendacionAutomatica ?? ''
        };
        this.actividadSemanal = kpi.actividadSemanal ?? [];
        this.reportesPorMes = kpi.reportesPorMes ?? [];
        this.usuariosReportantesPorMes = kpi.usuariosReportantesPorMes ?? [];
        this.reportesPorCategoria = kpi.reportesPorCategoria ?? [];
        this.reportesPorEstado = kpi.reportesPorEstado ?? [];
        this.reportesPorZona = kpi.reportesPorZona ?? [];
        this.tiemposPorZona = kpi.tiemposPorZona ?? [];
        this.zonasCriticas = kpi.zonasCriticas ?? [];
        this.proyeccionMensual = kpi.proyeccionMensual ?? [];
        this.categoriasConCrecimiento = kpi.categoriasConCrecimiento ?? [];
        this.zonasRiesgo = kpi.zonasRiesgo ?? [];
        this.nivelesAgua = kpi.nivelesAgua ?? [];
        this.loading = false;
        this.scheduleChangeDetection();
        this.renderChartsWhenReady();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.scheduleChangeDetection();
      }
    });
  }

  aplicarFiltros(): void {
    this.filtroAplicado = this.etiquetaFiltro();
    this.cargarKpis();
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      year: this.anioActual,
      month: '',
      day: ''
    }, { emitEvent: false });
    this.filtroAplicado = this.anioActual;
    this.cargarKpis();
  }

  cambiarTipoAnalisis(tipo: TipoAnalisis): void {
    if (this.tipoAnalisis === tipo) {
      return;
    }
    this.tipoAnalisis = tipo;
    this.limpiarPeriodoFueraDelModo();
    this.scheduleChangeDetection();
    this.renderChartsWhenReady();
  }

  get mesesDisponibles(): Array<{ value: string; label: string }> {
    const mesesPermitidos = this.tipoAnalisis === 'predictivo'
      ? new Set(['10', '11', '12'])
      : new Set(['06', '07', '08', '09']);
    return this.todosLosMeses.filter((mes) => mesesPermitidos.has(mes.value));
  }

  get hayReportesDescriptivos(): boolean {
    return this.reportesPorMesDescriptivos.length > 0;
  }

  get hayUsuariosReportantesDescriptivos(): boolean {
    return this.usuariosReportantesPorMesDescriptivos.length > 0;
  }

  get hayProyeccionPredictiva(): boolean {
    return this.proyeccionMensualPredictiva.length > 0;
  }

  get anioSeleccionado(): string {
    return this.filtroForm.controls.year.value;
  }

  get mesSeleccionado(): string {
    return this.filtroForm.controls.month.value;
  }

  get diasDisponibles(): string[] {
    if (!this.anioSeleccionado || !this.mesSeleccionado) {
      return [];
    }
    const totalDias = new Date(Number(this.anioSeleccionado), Number(this.mesSeleccionado), 0).getDate();
    return Array.from({ length: totalDias }, (_, index) => String(index + 1).padStart(2, '0'));
  }

  get mesDeshabilitado(): boolean {
    return !this.anioSeleccionado;
  }

  get diaDeshabilitado(): boolean {
    return !this.anioSeleccionado || !this.mesSeleccionado;
  }

  cambioAnio(): void {
    this.filtroForm.patchValue({ month: '', day: '' }, { emitEvent: false });
    this.aplicarFiltros();
  }

  cambioMes(): void {
    this.filtroForm.patchValue({ day: '' }, { emitEvent: false });
    this.aplicarFiltros();
  }

  cambioDia(): void {
    this.aplicarFiltros();
  }

  etiquetaMes(value: string): string {
    return this.todosLosMeses.find((mes) => mes.value === value)?.label ?? value;
  }

  trackByValue(_index: number, value: string): string {
    return value;
  }

  trackByMes(_index: number, mes: { value: string; label: string }): string {
    return mes.value;
  }

  trackByAnio(_index: number, anio: string): string {
    return anio;
  }

  private configurarFiltrosAutomaticos(): void {
    const { year, month, day } = this.filtroForm.controls;
    year.valueChanges.subscribe(() => this.cambioAnio());
    month.valueChanges.subscribe(() => this.cambioMes());
    day.valueChanges.subscribe(() => this.cambioDia());
  }

  private limpiarPeriodoFueraDelModo(): void {
    const mesActual = this.filtroForm.controls.month.value;
    const mesPermitido = !mesActual || this.mesesDisponibles.some((mes) => mes.value === mesActual);
    if (mesPermitido) {
      return;
    }
    this.filtroForm.patchValue({ month: '', day: '' }, { emitEvent: false });
    this.filtroAplicado = this.etiquetaFiltro();
    this.cargarKpis();
  }

  private filtrosActuales(): DashboardFiltros {
    const valores = this.filtroForm.getRawValue();
    if (!valores.year) {
      return {};
    }
    if (valores.month && valores.day) {
      const fecha = `${valores.year}-${valores.month}-${valores.day}`;
      return {
        fechaDesde: fecha,
        fechaHasta: fecha
      };
    }
    if (valores.month) {
      const monthValue = `${valores.year}-${valores.month}`;
      return {
        fechaDesde: `${monthValue}-01`,
        fechaHasta: this.ultimoDiaDelMes(monthValue)
      };
    }
    return {
      fechaDesde: `${valores.year}-01-01`,
      fechaHasta: `${valores.year}-12-31`
    };
  }

  get actividadMaxima(): number {
    return Math.max(...this.actividadSemanal.map((item) => item.valor), 1);
  }

  get zonaMaxima(): number {
    return Math.max(...this.reportesPorZona.map((item) => item.cantidad), 1);
  }

  get mesMaximo(): number {
    return Math.max(...this.reportesPorMes.map((item) => item.cantidad), 1);
  }

  get categoriaMaxima(): number {
    return Math.max(...this.reportesPorCategoria.map((item) => item.cantidad), 1);
  }

  get estadoTotal(): number {
    return this.reportesPorEstado.reduce((total, item) => total + item.cantidad, 0);
  }

  get proyeccionMaxima(): number {
    return Math.max(...this.proyeccionMensual.map((item) => item.estimado), 1);
  }

  alturaActividad(valor: number): number {
    if (valor <= 0) {
      return 4;
    }
    return Math.max(8, Math.round((valor / this.actividadMaxima) * 100));
  }

  anchoZona(cantidad: number): number {
    if (cantidad <= 0) {
      return 0;
    }
    return Math.round((cantidad / this.zonaMaxima) * 100);
  }

  alturaMes(cantidad: number): number {
    if (cantidad <= 0) {
      return 4;
    }
    return Math.max(10, Math.round((cantidad / this.mesMaximo) * 100));
  }

  anchoCategoria(cantidad: number): number {
    if (cantidad <= 0) {
      return 0;
    }
    return Math.round((cantidad / this.categoriaMaxima) * 100);
  }

  anchoEstado(cantidad: number): number {
    if (cantidad <= 0 || this.estadoTotal <= 0) {
      return 0;
    }
    return Math.round((cantidad / this.estadoTotal) * 100);
  }

  alturaProyeccion(estimado: number): number {
    if (estimado <= 0) {
      return 4;
    }
    return Math.max(12, Math.round((estimado / this.proyeccionMaxima) * 100));
  }

  nivelBarra(nivel?: number): number {
    if (nivel == null) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(nivel)));
  }

  riesgoClass(nivel: string): string {
    return `risk-${nivel.toLowerCase()}`;
  }

  private etiquetaFiltro(): string {
    const valores = this.filtroForm.getRawValue();
    if (!valores.year) {
      return 'Todos los registros';
    }
    if (valores.month && valores.day) {
      return this.formatearFecha(`${valores.year}-${valores.month}-${valores.day}`);
    }
    if (valores.month) {
      return `${this.etiquetaMes(valores.month)} ${valores.year}`;
    }
    return valores.year;
  }

  private ultimoDiaDelMes(monthValue: string): string {
    const [year, month] = monthValue.split('-').map(Number);
    const ultimoDia = new Date(year, month, 0).getDate();
    return `${monthValue}-${String(ultimoDia).padStart(2, '0')}`;
  }

  private formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private scheduleChangeDetection(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }

  private renderChartsWhenReady(): void {
    if (!this.viewReady || !this.chartCanvases) {
      return;
    }
    queueMicrotask(() => this.renderCharts());
  }

  private renderCharts(): void {
    if (!this.chartCanvases) {
      return;
    }

    const activeChartIds = new Set<string>();
    this.chartCanvases.forEach((chartRef) => {
      const canvas = chartRef.nativeElement;
      const chartId = canvas.dataset['chartId'];
      if (!chartId) {
        return;
      }
      activeChartIds.add(chartId);
      const config = this.chartConfig(chartId);
      if (config) {
        this.upsertChart(chartId, canvas, config);
      }
    });
    this.destroyMissingCharts(activeChartIds);
  }

  private chartConfig(chartId: string): ChartConfiguration | null {
    switch (chartId) {
      case 'reportes-mes':
        return this.barChart(
          this.reportesPorMesDescriptivos.map((item) => item.mes),
          this.reportesPorMesDescriptivos.map((item) => item.cantidad),
          'Reportes',
          '#2563eb',
          this.monthlyBarChartOptions()
        );
      case 'tendencia-reportes':
        return this.lineChart(
          this.reportesPorMesDescriptivos.map((item) => item.mes),
          this.reportesPorMesDescriptivos.map((item) => item.cantidad),
          'Tendencia',
          '#0f766e',
          this.monthlyLineChartOptions()
        );
      case 'reportes-estado':
        return this.doughnutChart(
          this.estadosVisiblesEnGrafico.map((item) => item.estado),
          this.estadosVisiblesEnGrafico.map((item) => item.cantidad)
        );
      case 'reportes-categoria':
        return this.doughnutChart(
          this.reportesPorCategoria.map((item) => item.categoria),
          this.reportesPorCategoria.map((item) => item.cantidad)
        );
      case 'usuarios-reportantes-mes':
        return this.barChart(
          this.usuariosReportantesPorMesDescriptivos.map((item) => item.mes),
          this.usuariosReportantesPorMesDescriptivos.map((item) => item.cantidad),
          'Usuarios',
          '#f59e0b',
          this.monthlyBarChartOptions()
        );
      case 'reportes-zona':
        return this.horizontalBarChart(
          this.reportesPorZona.map((item) => item.nombre),
          this.reportesPorZona.map((item) => item.cantidad),
          'Reportes',
          '#0f766e',
          this.zonesBarChartOptions()
        );
      case 'proyeccion-reportes':
        return this.barChart(
          this.proyeccionMensualPredictiva.map((item) => item.mes),
          this.proyeccionMensualPredictiva.map((item) => item.estimado),
          'Reportes proyectados',
          '#7c3aed',
          this.monthlyBarChartOptions()
        );
      case 'tendencia-proyectada':
        return this.lineChart(
          this.proyeccionMensualPredictiva.map((item) => item.mes),
          this.proyeccionMensualPredictiva.map((item) => item.estimado),
          'Tendencia proyectada',
          '#7c3aed',
          this.monthlyLineChartOptions()
        );
      case 'crecimiento-categorias':
        return this.barChart(
          this.categoriasConCrecimiento.map((item) => item.categoria),
          this.categoriasConCrecimiento.map((item) => item.estimadoSiguienteMes),
          'Estimado',
          '#dc2626'
        );
      case 'riesgo-zonas':
        return this.horizontalBarChart(
          this.zonasRiesgo.map((item) => item.zona),
          this.zonasRiesgo.map((item) => item.reportes),
          'Reportes esperados',
          '#b45309',
          this.zonesBarChartOptions()
        );
      case 'estados-proyectados':
        return this.doughnutChart(
          this.estadosProyectados.map((item) => item.estado),
          this.estadosProyectados.map((item) => item.cantidad)
        );
      case 'riesgo-operativo':
        return this.doughnutChart(
          this.distribucionRiesgo.map((item) => item.nivel),
          this.distribucionRiesgo.map((item) => item.cantidad)
        );
      default:
        return null;
    }
  }

  private get totalProyectadoMensual(): number {
    return this.proyeccionMensualPredictiva.reduce((total, item) => total + item.estimado, 0);
  }

  private get distribucionRiesgo(): Array<{ nivel: string; cantidad: number }> {
    const niveles = new Map<string, number>();
    this.zonasRiesgo.forEach((item) => {
      const nivel = item.nivelRiesgo || 'Sin nivel';
      niveles.set(nivel, (niveles.get(nivel) ?? 0) + 1);
    });
    return Array.from(niveles.entries()).map(([nivel, cantidad]) => ({ nivel, cantidad }));
  }

  private get estadosVisiblesEnGrafico(): ReportePorEstadoItem[] {
    return this.reportesPorEstado.filter((item) => item.estado.toLowerCase() !== 'duplicados');
  }

  get estadosProyectados(): ReportePorEstadoItem[] {
    const totalProyectado = this.totalProyectadoMensual;
    const estadosBase = this.estadosVisiblesEnGrafico.filter((item) => item.cantidad > 0);
    const totalBase = estadosBase.reduce((total, item) => total + item.cantidad, 0);
    if (totalProyectado <= 0 || totalBase <= 0) {
      return [];
    }

    const proyectados = estadosBase.map((item) => ({
      estado: item.estado,
      cantidad: Math.round((item.cantidad / totalBase) * totalProyectado)
    }));
    const diferencia = totalProyectado - proyectados.reduce((total, item) => total + item.cantidad, 0);
    if (proyectados.length > 0) {
      proyectados[0].cantidad += diferencia;
    }
    return proyectados;
  }

  private get reportesPorMesDescriptivos(): ReportePorMesItem[] {
    return this.reportesPorMes.filter((item) => this.mesesDescriptivos.has(item.mes));
  }

  private get usuariosReportantesPorMesDescriptivos(): UsuarioReportantePorMesItem[] {
    return this.usuariosReportantesPorMes.filter((item) => this.mesesDescriptivos.has(item.mes));
  }

  private get proyeccionMensualPredictiva(): ProyeccionMensualItem[] {
    return this.proyeccionMensual.filter((item) => this.mesesPredictivos.has(item.mes));
  }

  private barChart(
    labels: string[],
    data: number[],
    label: string,
    color: string,
    options: ChartOptions<'bar'> = this.verticalBarChartOptions()
  ): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color,
          borderRadius: 8,
          maxBarThickness: 42
        }]
      },
      options
    };
  }

  private horizontalBarChart(
    labels: string[],
    data: number[],
    label: string,
    color: string,
    options: ChartOptions<'bar'> = this.horizontalBarChartOptions()
  ): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color,
          borderRadius: 8,
          maxBarThickness: 28
        }]
      },
      options: {
        ...options,
        indexAxis: 'y'
      }
    };
  }

  private lineChart(
    labels: string[],
    data: number[],
    label: string,
    color = '#0f766e',
    options: ChartOptions<'line'> = this.lineChartOptions()
  ): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 3,
          fill: false,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 5,
          showLine: true,
          tension: 0
        }]
      },
      options
    };
  }

  private doughnutChart(labels: string[], data: number[]): ChartConfiguration<'doughnut'> {
    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: '#475569',
              font: { size: 11, weight: 700 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}`
            }
          },
          datalabels: {
            color: '#0f172a',
            font: {
              size: 11,
              weight: 900
            },
            formatter: (value: number) => value > 0 ? value : '',
            textStrokeColor: '#ffffff',
            textStrokeWidth: 3
          }
        }
      }
    };
  }

  private verticalBarChartOptions(): ChartOptions<'bar'> {
    return {
      ...this.axisChartOptions<'bar'>(),
      plugins: {
        ...this.axisChartOptions<'bar'>().plugins,
        datalabels: {
          anchor: 'end',
          align: 'top',
          clamp: true,
          color: '#0f172a',
          font: {
            size: 11,
            weight: 900
          },
          formatter: (value: number) => value > 0 ? value : ''
        }
      }
    };
  }

  private monthlyBarChartOptions(): ChartOptions<'bar'> {
    return {
      ...this.verticalBarChartOptions(),
      scales: {
        ...this.verticalBarChartOptions().scales,
        y: {
          beginAtZero: true,
          suggestedMax: 120,
          grid: { color: '#e2e8f0' },
          ticks: {
            stepSize: 20,
            precision: 0,
            color: '#64748b',
            font: { size: 11, weight: 700 }
          }
        }
      }
    };
  }

  private horizontalBarChartOptions(): ChartOptions<'bar'> {
    return {
      ...this.axisChartOptions<'bar'>(),
      plugins: {
        ...this.axisChartOptions<'bar'>().plugins,
        datalabels: {
          anchor: 'end',
          align: 'right',
          clamp: true,
          color: '#0f172a',
          font: {
            size: 11,
            weight: 900
          },
          formatter: (value: number) => value > 0 ? value : ''
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          ticks: {
            stepSize: 5,
            precision: 0,
            color: '#64748b',
            font: { size: 11, weight: 700 }
          }
        },
        y: {
          grid: { color: '#e2e8f0' },
          ticks: { color: '#64748b', font: { size: 11, weight: 700 } }
        }
      }
    };
  }

  private zonesBarChartOptions(): ChartOptions<'bar'> {
    return {
      ...this.horizontalBarChartOptions(),
      scales: {
        ...this.horizontalBarChartOptions().scales,
        x: {
          beginAtZero: true,
          suggestedMax: 50,
          grid: { display: false },
          ticks: {
            stepSize: 5,
            precision: 0,
            color: '#64748b',
            font: { size: 11, weight: 700 }
          }
        }
      }
    };
  }

  private lineChartOptions(): ChartOptions<'line'> {
    return {
      ...this.axisChartOptions<'line'>(),
      plugins: {
        ...this.axisChartOptions<'line'>().plugins,
        datalabels: {
          align: 'top',
          anchor: 'end',
          color: '#0f172a',
          font: {
            size: 11,
            weight: 900
          },
          formatter: (value: number) => value > 0 ? value : ''
        }
      }
    };
  }

  private monthlyLineChartOptions(): ChartOptions<'line'> {
    return {
      ...this.lineChartOptions(),
      scales: {
        ...this.lineChartOptions().scales,
        y: {
          beginAtZero: true,
          suggestedMax: 120,
          grid: { color: '#e2e8f0' },
          ticks: {
            stepSize: 20,
            precision: 0,
            color: '#64748b',
            font: { size: 11, weight: 700 }
          }
        }
      }
    };
  }

  private axisChartOptions<T extends 'bar' | 'line'>(): ChartOptions<T> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { weight: 800 },
          bodyFont: { weight: 700 }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 11, weight: 700 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: { precision: 0, color: '#64748b', font: { size: 11, weight: 700 } }
        }
      }
    } as unknown as ChartOptions<T>;
  }

  private upsertChart(chartId: string, canvas: HTMLCanvasElement, config: ChartConfiguration): void {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    this.charts.get(chartId)?.destroy();
    this.charts.set(chartId, new Chart(context, config));
  }

  private destroyMissingCharts(activeChartIds: Set<string>): void {
    Array.from(this.charts.keys()).forEach((chartId) => {
      if (!activeChartIds.has(chartId)) {
        this.charts.get(chartId)?.destroy();
        this.charts.delete(chartId);
      }
    });
  }

  private destroyCharts(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts.clear();
  }
}
