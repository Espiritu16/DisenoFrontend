import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportePoblador } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reportes.component.html',
  styleUrl: './mis-reportes.component.css'
})
export class MisReportesComponent {
  statusFilter = 'Todos';
  selected?: ReportePoblador;
  message = '';
  reportes: ReportePoblador[] = [];

  constructor(private mock: MockDataService) {
    this.reportes = this.mock.getReportes();
  }

  get total(): number { return this.reportes.length; }
  get pendientes(): number { return this.reportes.filter((r) => r.status === 'Pendiente').length; }
  get enProceso(): number { return this.reportes.filter((r) => r.status === 'En proceso').length; }
  get resueltos(): number { return this.reportes.filter((r) => r.status === 'Resuelto').length; }

  get filtered(): ReportePoblador[] {
    return this.statusFilter === 'Todos' ? this.reportes : this.reportes.filter((r: ReportePoblador) => r.status === this.statusFilter);
  }

  select(r: ReportePoblador): void { this.selected = r; }
  retry(r: ReportePoblador): void { this.message = `Se reenvió ${r.id} (simulado).`; }
  refresh(): void { this.reportes = this.mock.getReportes(); this.message = 'Listado actualizado.'; }
  trackById(_: number, r: ReportePoblador): string { return r.id; }
}
