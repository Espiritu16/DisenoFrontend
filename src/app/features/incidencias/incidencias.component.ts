import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, ReportStatus } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incidencias.component.html',
  styleUrl: './incidencias.component.css'
})
export class IncidenciasComponent {
  incidencias: Incidencia[] = [];
  selected?: Incidencia;
  responsible = '';
  evidence = '';
  feedback = '';

  constructor(private mock: MockDataService) {
    this.incidencias = this.mock.getIncidencias();
  }

  pick(i: Incidencia): void { this.selected = i; this.responsible = i.responsible ?? ''; this.evidence = i.evidence ?? ''; }

  setStatus(status: ReportStatus): void {
    if (!this.selected) return;
    this.incidencias = this.mock.updateIncidenciaStatus(this.selected.id, status);
    const current = this.incidencias.find((i: Incidencia) => i.id === this.selected!.id);
    if (current) this.pick(current);
    this.feedback = 'Estado actualizado.';
  }

  saveAssign(): void {
    if (!this.selected || !this.responsible) return;
    this.incidencias = this.mock.assignIncidencia(this.selected.id, this.responsible);
    const current = this.incidencias.find((i: Incidencia) => i.id === this.selected!.id);
    if (current) this.pick(current);
    this.feedback = 'Responsable asignado.';
  }

  saveEvidence(): void {
    if (!this.selected || !this.evidence) return;
    this.incidencias = this.mock.addEvidence(this.selected.id, this.evidence);
    const current = this.incidencias.find((i: Incidencia) => i.id === this.selected!.id);
    if (current) this.pick(current);
    this.feedback = 'Evidencia guardada.';
  }
}
