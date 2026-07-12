import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  ZonaRiesgoItem
} from '../../../core/api/api-models';

type DashboardFilterMode = 'all' | 'month' | 'day' | 'range';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
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
    promedioHorasResolucion: 0,
    incrementoEstimadoPorcentaje: 0,
    recomendacionAutomatica: ''
  };

  actividadSemanal: ActividadSemanalItem[] = [];
  reportesPorMes: ReportePorMesItem[] = [];
  reportesPorCategoria: ReportePorCategoriaItem[] = [];
  reportesPorEstado: ReportePorEstadoItem[] = [];
  reportesPorZona: ReportePorZonaItem[] = [];
  tiemposPorZona: TiempoAtencionPorZonaItem[] = [];
  zonasCriticas: TendenciaZonaItem[] = [];
  proyeccionMensual: ProyeccionMensualItem[] = [];
  categoriasConCrecimiento: CategoriaCrecimientoItem[] = [];
  zonasRiesgo: ZonaRiesgoItem[] = [];
  nivelesAgua: NivelAguaResponse[] = [];
  filtroAplicado = 'Todos los registros';
  filtroForm = new FormGroup({
    mode: new FormControl<DashboardFilterMode>('all', { nonNullable: true }),
    month: new FormControl('', { nonNullable: true }),
    day: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true })
  });

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarKpis();
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
          promedioHorasResolucion: kpi.promedioHorasResolucion,
          incrementoEstimadoPorcentaje: kpi.incrementoEstimadoPorcentaje ?? 0,
          recomendacionAutomatica: kpi.recomendacionAutomatica ?? ''
        };
        this.actividadSemanal = kpi.actividadSemanal ?? [];
        this.reportesPorMes = kpi.reportesPorMes ?? [];
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
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.scheduleChangeDetection();
      }
    });
  }

  cambiarModo(mode: DashboardFilterMode): void {
    this.filtroForm.controls.mode.setValue(mode);
  }

  aplicarFiltros(): void {
    this.filtroAplicado = this.etiquetaFiltro();
    this.cargarKpis();
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      mode: 'all',
      month: '',
      day: '',
      from: '',
      to: ''
    });
    this.filtroAplicado = 'Todos los registros';
    this.cargarKpis();
  }

  get modoFiltro(): DashboardFilterMode {
    return this.filtroForm.controls.mode.value;
  }

  get puedeAplicarFiltro(): boolean {
    const valores = this.filtroForm.getRawValue();
    if (valores.mode === 'all') {
      return true;
    }
    if (valores.mode === 'month') {
      return Boolean(valores.month);
    }
    if (valores.mode === 'day') {
      return Boolean(valores.day);
    }
    return Boolean(valores.from || valores.to);
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

  private filtrosActuales(): DashboardFiltros {
    const valores = this.filtroForm.getRawValue();
    if (valores.mode === 'month' && valores.month) {
      return {
        fechaDesde: `${valores.month}-01`,
        fechaHasta: this.ultimoDiaDelMes(valores.month)
      };
    }
    if (valores.mode === 'day' && valores.day) {
      return {
        fechaDesde: valores.day,
        fechaHasta: valores.day
      };
    }
    if (valores.mode === 'range') {
      return {
        fechaDesde: valores.from || undefined,
        fechaHasta: valores.to || undefined
      };
    }
    return {};
  }

  private etiquetaFiltro(): string {
    const valores = this.filtroForm.getRawValue();
    if (valores.mode === 'month' && valores.month) {
      const [year, month] = valores.month.split('-').map(Number);
      return new Date(year, month - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    }
    if (valores.mode === 'day' && valores.day) {
      return this.formatearFecha(valores.day);
    }
    if (valores.mode === 'range') {
      const desde = valores.from ? this.formatearFecha(valores.from) : 'inicio';
      const hasta = valores.to ? this.formatearFecha(valores.to) : 'hoy';
      return `${desde} - ${hasta}`;
    }
    return 'Todos los registros';
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
}
