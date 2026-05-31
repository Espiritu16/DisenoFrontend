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
  readonly partners = [
    { name: 'Sedapar', logo: '/brand-logos/sedapar.png' },
    { name: 'Sedalib', logo: '/brand-logos/sedalib.png' },
    { name: 'Sedacusco', logo: '/brand-logos/sedacusco.png' },
    { name: 'Epsel', logo: '/brand-logos/epsel.png' },
    { name: 'Emapa', logo: '/brand-logos/emapa.png' }
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
