import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AquaFooterComponent } from '../../../shared/public/aqua-footer/aqua-footer.component';
import { AquaHeaderComponent } from '../../../shared/public/aqua-header/aqua-header.component';
import { AquaMobileNavComponent } from '../../../shared/public/aqua-mobile-nav/aqua-mobile-nav.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, AquaHeaderComponent, AquaFooterComponent, AquaMobileNavComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  // En la demo pública no se muestran marcas de empresas reales: los prestadores
  // de este listado son ejemplos inventados para ilustrar el tipo de entidad usuaria.
  readonly partners = [
    { name: 'EPS Aguas Claras', logo: '' },
    { name: 'EPS Valle Verde', logo: '' },
    { name: 'EMAPA Los Andes', logo: '' },
    { name: 'EPS Río Sur', logo: '' },
    { name: 'SEDA Altiplano', logo: '' }
  ];

  readonly processSteps = [
    {
      title: 'Reporta',
      text: 'El ciudadano registra ubicación, tipo de incidencia y evidencias.',
      icon: '!'
    },
    {
      title: 'Valida',
      text: 'El reporte queda pendiente y se revisa si es válido o duplicado.',
      icon: '?'
    },
    {
      title: 'Asigna',
      text: 'El administrador deriva el reporte y crea un caso con responsable.',
      icon: '→'
    },
    {
      title: 'Atiende',
      text: 'El operador trabaja el caso, actualiza avances o escala si corresponde.',
      icon: '✓'
    },
    {
      title: 'Consulta',
      text: 'El vecino revisa trazabilidad, historial y resolución del caso.',
      icon: 'i'
    }
  ];
}
