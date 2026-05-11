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
  readonly destacados = [
    {
      title: 'Reporta en segundos',
      text: 'Registra fugas, baja presión o agua turbia con ubicación exacta y evidencia fotográfica.',
      cta: 'Reportar ahora',
      route: '/reportar',
      badge: 'Flujo rápido',
      image:
        'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Monitorea el servicio',
      text: 'Consulta alertas comunitarias, zonas afectadas y tiempos estimados de atención.',
      cta: 'Ver estado',
      route: '/estado-servicio',
      badge: 'Información en vivo',
      image:
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Sigue tus casos',
      text: 'Revisa el avance de tus reportes y mantén trazabilidad desde el registro hasta el cierre.',
      cta: 'Ir a seguimiento',
      route: '/mis-reportes',
      badge: 'Trazabilidad',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80'
    }
  ];
}
