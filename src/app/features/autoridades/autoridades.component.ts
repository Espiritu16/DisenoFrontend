import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IndicadorAutoridad } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-autoridades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autoridades.component.html',
  styleUrl: './autoridades.component.css'
})
export class AutoridadesComponent {
  indicadores: IndicadorAutoridad[] = [];
  exportMessage = '';

  constructor(private mock: MockDataService) {
    this.indicadores = this.mock.getIndicadores();
  }

  exportar(): void { this.exportMessage = 'Reporte consolidado exportado (simulado).'; }
}
