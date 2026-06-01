import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface WireframeContactChannel {
  title: string;
  description: string;
  value: string;
  action: string;
  href: string;
  tone: 'phone' | 'whatsapp';
  resolves: string[];
}

interface WireframeQuickItem {
  label: string;
  value: string;
  tone: 'normal' | 'alert';
}

@Component({
  selector: 'app-wireframe-contacto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wireframe-contacto.component.html',
  styleUrl: './wireframe-contacto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WireframeContactoComponent implements OnInit, OnDestroy {
  readonly citizenName = 'María Ciudadana';

  readonly navItems = [
    { label: 'Inicio', href: '/wireframe/inicio', active: false },
    { label: 'Reportar', href: '/wireframe/reportar', active: false },
    { label: 'Mis Reportes', href: '/wireframe/mis-reportes', active: false },
    { label: 'Contacto', href: '/wireframe/contacto', active: true }
  ];

  readonly quickItems: WireframeQuickItem[] = [
    { label: 'Horario de atención', value: 'Lun - Sáb, 8:00 AM - 6:00 PM', tone: 'normal' },
    { label: 'Emergencias', value: 'Atención 24/7 casos críticos', tone: 'alert' },
    { label: 'Cobertura', value: 'Provincia de Lima', tone: 'normal' }
  ];

  readonly channels: WireframeContactChannel[] = [
    {
      title: 'Teléfono principal',
      description: 'Consultas generales',
      value: '+51 999 000 111',
      action: 'Llamar',
      href: 'tel:+51999000111',
      tone: 'phone',
      resolves: ['Consultas generales', 'Información sobre servicios', 'Dudas sobre la plataforma', 'Orientación ciudadana']
    },
    {
      title: 'Soporte técnico',
      description: 'Incidencias operativas',
      value: '+51 944 555 221',
      action: 'Llamar',
      href: 'tel:+51944555221',
      tone: 'phone',
      resolves: ['Problemas de presión', 'Fugas reportadas', 'Calidad del agua', 'Validación de reportes']
    },
    {
      title: 'WhatsApp general',
      description: 'Atención rápida',
      value: '+51 999 000 111',
      action: 'Abrir WhatsApp',
      href: 'https://wa.me/51999000111',
      tone: 'whatsapp',
      resolves: ['Estado de cuenta', 'Información general', 'Consultas rápidas', 'Uso de la plataforma']
    },
    {
      title: 'WhatsApp soporte',
      description: 'Seguimiento de incidencias',
      value: '+51 944 555 221',
      action: 'Abrir WhatsApp',
      href: 'https://wa.me/51944555221',
      tone: 'whatsapp',
      resolves: ['Estado de reportes', 'Seguimiento de casos', 'Validación de incidencias', 'Casos en proceso']
    }
  ];

  ngOnInit(): void {
    document.body.classList.add('aqua-wireframe-open');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('aqua-wireframe-open');
  }
}
