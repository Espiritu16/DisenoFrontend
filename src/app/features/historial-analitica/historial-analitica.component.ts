import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, MetricaAtencion } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-historial-analitica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-analitica.component.html',
  styleUrl: './historial-analitica.component.css'
})
export class HistorialAnaliticaComponent {
  period = '30 días';
  metricas: MetricaAtencion[] = [];
  incidencias: Incidencia[] = [];

  constructor(private mock: MockDataService) {
    this.metricas = this.mock.getMetricas();
    this.incidencias = this.mock.getIncidencias();
  }
}
