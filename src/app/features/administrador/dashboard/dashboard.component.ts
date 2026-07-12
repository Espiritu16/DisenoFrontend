import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/api/dashboard.service';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
  exportLoading = false;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarKpis();
  }

  cargarKpis(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.kpis().subscribe({
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

  exportarPdf(): void {
    this.exportLoading = true;
    this.dashboardService.exportarPdf().subscribe({
      next: (blob) => {
        this.exportLoading = false;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reporte-operativo.pdf';
        link.click();
        URL.revokeObjectURL(url);
        this.scheduleChangeDetection();
      },
      error: (error: unknown) => {
        this.exportLoading = false;
        this.error = apiErrorMessage(error);
        this.scheduleChangeDetection();
      }
    });
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

  private scheduleChangeDetection(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }
}
