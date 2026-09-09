import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface WireframeStep {
  title: string;
  text: string;
  icon: string;
}

interface WireframePartner {
  name: string;
}

@Component({
  selector: 'app-wireframe-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wireframe-inicio.component.html',
  styleUrl: './wireframe-inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WireframeInicioComponent implements OnInit, OnDestroy {
  readonly citizenName = 'María Ciudadana';

  readonly navItems = [
    { label: 'Inicio', href: '/wireframe/inicio', active: true },
    { label: 'Reportar', href: '/wireframe/reportar', active: false },
    { label: 'Mis reportes', href: '/wireframe/mis-reportes', active: false },
    { label: 'Contacto', href: '/wireframe/contacto', active: false }
  ];

  readonly partners: WireframePartner[] = [
    { name: 'EPS Aguas Claras' },
    { name: 'EPS Valle Verde' },
    { name: 'EMAPA Los Andes' },
    { name: 'EPS Río Sur' },
    { name: 'SEDA Altiplano' }
  ];

  readonly steps: WireframeStep[] = [
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
      icon: '>'
    },
    {
      title: 'Atiende',
      text: 'El operador trabaja el caso, actualiza avances o escala si corresponde.',
      icon: 'ok'
    },
    {
      title: 'Consulta',
      text: 'El vecino revisa trazabilidad, historial y resolución del caso.',
      icon: 'i'
    }
  ];

  ngOnInit(): void {
    document.body.classList.add('aqua-wireframe-open');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('aqua-wireframe-open');
  }
}
