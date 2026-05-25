import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Reporte {
  id: string;
  fecha: string;
  ciudadano: string;
  zona: string;
  tipo: string;
  estado: 'Pendiente' | 'En proceso' | 'Resuelto';
  descripcion: string;
  ubicacion: string;
  reportadoPor: string;
  evidencia?: string;
}

@Component({
  selector: 'app-reportes-ciudadanos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-ciudadanos.component.html',
  styleUrl: './reportes-ciudadanos.component.css'
})
export class ReportesCiudadanosComponent implements OnInit {

  reportes: Reporte[] = [];
  selectedReporte: Reporte | null = null;

  statusFilter = 'Todos';
  tipoFilter = 'Todos';
  distritoFilter = 'Todos los distritos';
  fechaFilter = '';

  ngOnInit() {
    this.loadReportes();
    if (this.reportes.length > 0) {
      this.selectedReporte = this.reportes[0];
    }
  }

  loadReportes() {
    this.reportes = [
      {
        id: 'REP-1042',
        fecha: '12/10/2023',
        ciudadano: 'Juan Pérez',
        zona: 'San Isidro',
        tipo: 'Fuga en vía',
        estado: 'Pendiente',
        descripcion: '"Hay una rotura de tubería en la plata frente al parque. El agua está corriendo hacia la avenida principal desde hace 2 horas."',
        ubicacion: 'Av. Javier Prado Este 1500, San Isidro',
        reportadoPor: 'Juan Pérez (987654321)',
        evidencia: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="120"%3E%3Crect fill="%23999" width="300" height="120"/%3E%3C/svg%3E'
      },
      {
        id: 'REP-1041',
        fecha: '12/10/2023',
        ciudadano: 'María Gómez',
        zona: 'Miraflores',
        tipo: 'Baja presión',
        estado: 'En proceso',
        descripcion: 'El agua llega con muy baja presión a mi domicilio. He revisado todas las llaves y el problema persiste desde ayer.',
        ubicacion: 'Calle Principal 456, Miraflores',
        reportadoPor: 'María Gómez (987654322)',
      },
      {
        id: 'REP-1040',
        fecha: '11/10/2023',
        ciudadano: 'Carlos Ruiz',
        zona: 'Surco',
        tipo: 'Corte no programado',
        estado: 'Resuelto',
        descripcion: 'Se produjo un corte de agua sin aviso previo en toda la manzana. Ya se ha restablecido el servicio.',
        ubicacion: 'Av. La Paz 789, Surco',
        reportadoPor: 'Carlos Ruiz (987654323)',
      }
    ];
  }

  onSelectReporte(reporte: Reporte) {
    this.selectedReporte = reporte;
  }

  onFiltrar() {
    // Lógica de filtrado
    console.log('Filtros aplicados:', {
      estado: this.statusFilter,
      tipo: this.tipoFilter,
      distrito: this.distritoFilter,
      fecha: this.fechaFilter
    });
  }

  onDerivar() {
    if (this.selectedReporte) {
      console.log('Derivando reporte:', this.selectedReporte.id);
      // Lógica para derivar a atención de casos
    }
  }
}
