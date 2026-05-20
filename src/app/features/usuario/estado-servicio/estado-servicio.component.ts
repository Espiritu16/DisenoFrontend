import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertaServicio, ReportePoblador } from '../../../core/models/app-models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-estado-servicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estado-servicio.component.html',
  styleUrl: './estado-servicio.component.css'
})
export class EstadoServicioComponent {
  alertas: AlertaServicio[] = [];
  reportes: ReportePoblador[] = [];
  totalAlertas = 0;
  alertasRiesgo = 0;
  alertasInfo = 0;

  constructor(private mock: MockDataService) {
    this.alertas = this.mock.getAlertas();
    this.reportes = this.mock.getReportes().slice(0, 3);
    this.totalAlertas = this.alertas.length;
    this.alertasRiesgo = this.alertas.filter((a) => a.type === 'riesgo').length;
    this.alertasInfo = this.alertas.filter((a) => a.type !== 'riesgo').length;
  }
}
