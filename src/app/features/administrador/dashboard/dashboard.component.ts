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

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('dashboardChart') private chartCanvases?: QueryList<ElementRef<HTMLCanvasElement>>;

  loading = false;
  error = '';

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
  readonly mesesDisponibles = [
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
    return this.mesesDisponibles.find((mes) => mes.value === value)?.label ?? value;
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
          this.reportesPorMes.map((item) => item.mes),
          this.reportesPorMes.map((item) => item.cantidad),
          'Reportes',
          '#2563eb'
        );
      case 'tendencia-reportes':
        return this.lineChart(
          this.reportesPorMes.map((item) => item.mes),
          this.reportesPorMes.map((item) => item.cantidad),
          'Tendencia'
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
          this.usuariosReportantesPorMes.map((item) => item.mes),
          this.usuariosReportantesPorMes.map((item) => item.cantidad),
          'Usuarios',
          '#f59e0b'
        );
      case 'reportes-zona':
        return this.horizontalBarChart(
          this.reportesPorZona.map((item) => item.nombre),
          this.reportesPorZona.map((item) => item.cantidad),
          'Reportes',
          '#0f766e'
        );
      default:
        return null;
    }
  }

  private get estadosVisiblesEnGrafico(): ReportePorEstadoItem[] {
    return this.reportesPorEstado.filter((item) => item.estado.toLowerCase() !== 'duplicados');
  }

  private barChart(labels: string[], data: number[], label: string, color: string): ChartConfiguration<'bar'> {
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
      options: this.axisChartOptions<'bar'>()
    };
  }

  private horizontalBarChart(labels: string[], data: number[], label: string, color: string): ChartConfiguration<'bar'> {
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
        ...this.axisChartOptions<'bar'>(),
        indexAxis: 'y'
      }
    };
  }

  private lineChart(labels: string[], data: number[], label: string): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: '#0f766e',
          backgroundColor: '#0f766e',
          borderWidth: 3,
          fill: false,
          pointBackgroundColor: '#0f766e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 5,
          showLine: true,
          tension: 0
        }]
      },
      options: this.axisChartOptions<'line'>()
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
