import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AlertaServicioResponse, ApiAlertSeverity, ReporteResponse } from '../../../core/api/api-models';
import { AuthService } from '../../../core/api/auth.service';
import { EstadoServicioService } from '../../../core/api/estado-servicio.service';
import { ReportesService } from '../../../core/api/reportes.service';
import { reportStatusLabel } from '../../../core/api/api-mappers';
import { AquaFooterComponent } from '../../../shared/public/aqua-footer/aqua-footer.component';
import { AquaHeaderComponent } from '../../../shared/public/aqua-header/aqua-header.component';
import { AquaMobileNavComponent } from '../../../shared/public/aqua-mobile-nav/aqua-mobile-nav.component';

@Component({
  selector: 'app-estado-servicio',
  standalone: true,
  imports: [CommonModule, RouterLink, AquaHeaderComponent, AquaFooterComponent, AquaMobileNavComponent],
  templateUrl: './estado-servicio.component.html',
  styleUrl: './estado-servicio.component.css'
})
export class EstadoServicioComponent implements OnInit {
  alertas: AlertaServicioResponse[] = [];
  reportes: ReporteResponse[] = [];
  totalAlertas = 0;
  alertasRiesgo = 0;
  alertasInfo = 0;
  message = '';
  loadingAlertas = false;
  alertasError = '';

  constructor(
    private auth: AuthService,
    private estadoServicioService: EstadoServicioService,
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarReportes();
  }

  statusLabel = reportStatusLabel;

  alertaTipoLabel(alerta: AlertaServicioResponse): string {
    const labels: Record<AlertaServicioResponse['tipo'], string> = {
      CORTE_PROGRAMADO: 'Corte programado',
      CORTE_NO_PROGRAMADO: 'Corte no programado',
      MANTENIMIENTO: 'Mantenimiento',
      RIESGO_DESABASTECIMIENTO: 'Riesgo',
      INFORMATIVA: 'Informativa'
    };
    return labels[alerta.tipo];
  }

  esRiesgo(alerta: AlertaServicioResponse): boolean {
    return alerta.severidad === 'ALTA' || alerta.severidad === 'CRITICA' || alerta.tipo === 'RIESGO_DESABASTECIMIENTO';
  }

  severityClass(severidad: ApiAlertSeverity): string {
    return severidad === 'ALTA' || severidad === 'CRITICA' ? 'risk' : 'info';
  }

  rangoAlerta(alerta: AlertaServicioResponse): string {
    if (alerta.iniciaEn && alerta.finalizaEn) {
      return `${this.formatearFechaHora(alerta.iniciaEn)} - ${this.formatearFechaHora(alerta.finalizaEn)}`;
    }
    if (alerta.iniciaEn) {
      return `Desde ${this.formatearFechaHora(alerta.iniciaEn)}`;
    }
    if (alerta.finalizaEn) {
      return `Hasta ${this.formatearFechaHora(alerta.finalizaEn)}`;
    }
    return 'Vigencia inmediata';
  }

  private cargarAlertas(): void {
    this.loadingAlertas = true;
    this.alertasError = '';
    this.estadoServicioService.listarAlertas().subscribe({
      next: (alertas) => {
        this.loadingAlertas = false;
        this.alertas = alertas;
        this.actualizarMetricasAlertas();
      },
      error: (error: unknown) => {
        this.loadingAlertas = false;
        this.alertas = [];
        this.alertasError = apiErrorMessage(error);
        this.actualizarMetricasAlertas();
      }
    });
  }

  private cargarReportes(): void {
    if (!this.auth.token) {
      this.message = 'Inicia sesión para ver reportes reales de seguimiento.';
      return;
    }
    const source = this.auth.role === 'CIUDADANO'
      ? this.reportesService.listarMisReportes()
      : this.reportesService.listarTodos();
    source.subscribe({
      next: (reportes) => { this.reportes = reportes.slice(0, 3); },
      error: () => { this.message = 'No se pudieron cargar reportes reales con tu sesión actual.'; }
    });
  }

  private actualizarMetricasAlertas(): void {
    this.totalAlertas = this.alertas.length;
    this.alertasRiesgo = this.alertas.filter((alerta) => this.esRiesgo(alerta)).length;
    this.alertasInfo = this.totalAlertas - this.alertasRiesgo;
  }

  private formatearFechaHora(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }
}
