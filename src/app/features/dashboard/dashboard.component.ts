import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Incidencia, LecturaIoT, ReportePoblador } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  zoneFilter = 'Todas';
  statusFilter = 'Todos';
  incidencias: Incidencia[] = [];
  iot: LecturaIoT[] = [];
  reportes: ReportePoblador[] = [];

  constructor(private mock: MockDataService) {
    this.incidencias = this.mock.getIncidencias();
    this.iot = this.mock.getLecturasIot();
    this.reportes = this.mock.getReportes().slice(0, 6);
  }

  get filtered(): Incidencia[] {
    return this.incidencias.filter((i: Incidencia) => (this.zoneFilter === 'Todas' || i.zone === this.zoneFilter) && (this.statusFilter === 'Todos' || i.status === this.statusFilter));
  }

  get incidenciasActivas(): number {
    return this.incidencias.filter((i) => i.status !== 'Resuelto').length;
  }

  get nivelPromedioIot(): string {
    return this.iot.length ? (this.iot.reduce((a, b) => a + b.levelPct, 0) / this.iot.length).toFixed(0) : '0';
  }

  get casosCriticos(): number {
    return this.incidencias.filter((i) => i.severity === 'Crítica').length;
  }
}
