import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface WireframeIncidentType {
  label: string;
  helper: string;
  active: boolean;
}

@Component({
  selector: 'app-wireframe-reportar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wireframe-reportar.component.html',
  styleUrl: './wireframe-reportar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WireframeReportarComponent implements OnInit, OnDestroy {
  readonly citizenName = 'María Ciudadana';

  readonly navItems = [
    { label: 'Inicio', href: '/wireframe/inicio', active: false },
    { label: 'Reportar', href: '/wireframe/reportar', active: true },
    { label: 'Mis Reportes', href: '/wireframe/mis-reportes', active: false },
    { label: 'Contacto', href: '/wireframe/contacto', active: false }
  ];

  readonly incidentTypes: WireframeIncidentType[] = [
    { label: 'Fuga', helper: 'Pérdida visible de agua', active: true },
    { label: 'Baja presión', helper: 'Servicio débil o irregular', active: false },
    { label: 'Agua turbia', helper: 'Color, olor o sedimentos', active: false },
    { label: 'Corte', helper: 'Interrupción no programada', active: false }
  ];

  ngOnInit(): void {
    document.body.classList.add('aqua-wireframe-open');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('aqua-wireframe-open');
  }
}
