import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes-ciudadanos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-ciudadanos.component.html',
  styleUrl: './reportes-ciudadanos.component.css'
})
export class ReportesCiudadanosComponent {
  // Placeholder para futura implementación de filtros y estado.
  statusFilter = 'Todos';
}
