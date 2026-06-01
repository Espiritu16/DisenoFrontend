import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface WireframeReport {
  id: number;
  tipo: string;
  zona: string;
  fecha: string;
  estado: string;
  descripcion: string;
  direccion: string;
}

@Component({
  selector: 'app-wireframe-mis-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wireframe-mis-reportes.component.html',
  styleUrl: './wireframe-mis-reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WireframeMisReportesComponent implements OnInit, OnDestroy {
  readonly citizenName = 'María Ciudadana';

  readonly navItems = [
    { label: 'Inicio', href: '/wireframe/inicio', active: false },
    { label: 'Reportar', href: '/wireframe/reportar', active: false },
    { label: 'Mis Reportes', href: '/wireframe/mis-reportes', active: true },
    { label: 'Contacto', href: '/wireframe/contacto', active: false }
  ];

  readonly statusCards = [
    { label: 'Pendientes', value: '01' },
    { label: 'En atención', value: '02' },
    { label: 'Resueltos', value: '01' }
  ];

  readonly reports: WireframeReport[] = [
    {
      id: 128,
      tipo: 'Fuga',
      zona: 'San Miguel',
      fecha: '12 may 2026',
      estado: 'En atención',
      descripcion: 'Fuga visible cerca de la vereda principal. El flujo aumenta por la tarde.',
      direccion: 'Av. La Marina 1450'
    },
    {
      id: 124,
      tipo: 'Agua turbia',
      zona: 'Pueblo Libre',
      fecha: '08 may 2026',
      estado: 'Pendiente',
      descripcion: 'El agua presenta color oscuro desde la mañana.',
      direccion: 'Jr. Amazonas 220'
    },
    {
      id: 117,
      tipo: 'Baja presión',
      zona: 'Magdalena',
      fecha: '02 may 2026',
      estado: 'Resuelto',
      descripcion: 'Presión irregular en vivienda durante tres días.',
      direccion: 'Calle Grau 501'
    }
  ];

  readonly selectedReport = this.reports[0];

  ngOnInit(): void {
    document.body.classList.add('aqua-wireframe-open');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('aqua-wireframe-open');
  }
}
