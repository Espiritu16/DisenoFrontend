import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  readonly metrics = [
    { value: '1,204', label: 'Reportes registrados' },
    { value: '98%', label: 'Casos atendidos' },
    { value: '15', label: 'Distritos monitoreados' },
    { value: '42', label: 'Seguimientos activos' }
  ];

  readonly benefits = [
    {
      icon: 'flash_on',
      title: 'Reporte rápido',
      text: 'Registra incidencias en pocos pasos de forma clara y estructurada.'
    },
    {
      icon: 'visibility',
      title: 'Seguimiento transparente',
      text: 'Consulta el avance de tus casos y mantén trazabilidad total.'
    },
    {
      icon: 'notifications_active',
      title: 'Alertas comunitarias',
      text: 'Mantente informado sobre avisos importantes en tu zona.'
    },
    {
      icon: 'group_work',
      title: 'Coordinación operativa',
      text: 'Facilita la atención de incidencias mediante reportes estandarizados.'
    }
  ];

  readonly process = [
    {
      icon: 'location_on',
      kicker: 'Paso 1',
      title: 'Reporta',
      text: 'Crea un caso detallando la ubicación y el problema.'
    },
    {
      icon: 'engineering',
      kicker: 'Paso 2',
      title: 'Se revisa',
      text: 'El equipo operativo evalúa y programa la atención.'
    },
    {
      icon: 'check_circle',
      kicker: 'Paso 3',
      title: 'Resolución',
      text: 'Consulta actualizaciones hasta la resolución del caso.'
    }
  ];
}
