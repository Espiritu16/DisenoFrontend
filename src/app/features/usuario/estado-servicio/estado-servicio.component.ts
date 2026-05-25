import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertaServicio } from '../../../core/models/app-models';
import { AuthService } from '../../../core/api/auth.service';
import { ReportesService } from '../../../core/api/reportes.service';
import { ReporteResponse } from '../../../core/api/api-models';
import { reportStatusLabel } from '../../../core/api/api-mappers';

@Component({
  selector: 'app-estado-servicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estado-servicio.component.html',
  styleUrl: './estado-servicio.component.css'
})
export class EstadoServicioComponent implements OnInit {
  alertas: AlertaServicio[] = [
    { id: 'ALT-1', title: 'Mantenimiento programado', description: 'Corte parcial hoy 14:00 - 16:00.', type: 'mantenimiento', zone: 'Sector Centro' },
    { id: 'ALT-2', title: 'Riesgo de desabastecimiento', description: 'Reservorio Norte por debajo del 25%.', type: 'riesgo', zone: 'Anexo Norte' },
    { id: 'ALT-3', title: 'Corte no programado', description: 'Interrupción temporal por reparación de fuga.', type: 'corte', zone: 'Zona El Molino' }
  ];
  reportes: ReporteResponse[] = [];
  totalAlertas = 0;
  alertasRiesgo = 0;
  alertasInfo = 0;
  message = '';

  constructor(private auth: AuthService, private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.totalAlertas = this.alertas.length;
    this.alertasRiesgo = this.alertas.filter((a) => a.type === 'riesgo').length;
    this.alertasInfo = this.alertas.filter((a) => a.type !== 'riesgo').length;
    this.cargarReportes();
  }

  statusLabel = reportStatusLabel;

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
}
