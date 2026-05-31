import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AquaFooterComponent } from '../../../shared/public/aqua-footer/aqua-footer.component';
import { AquaHeaderComponent } from '../../../shared/public/aqua-header/aqua-header.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, AquaHeaderComponent, AquaFooterComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  readonly channels = [
    {
      title: 'Teléfono principal',
      description: 'Consultas generales',
      value: '+51 999 000 111',
      action: 'Llamar',
      href: 'tel:+51999000111',
      tone: 'phone',
      resolves: ['Consultas generales', 'Información sobre servicios', 'Dudas sobre la plataforma', 'Orientación ciudadana', 'Información institucional', 'Cobertura y horarios']
    },
    {
      title: 'Soporte técnico',
      description: 'Incidencias operativas',
      value: '+51 944 555 221',
      action: 'Llamar',
      href: 'tel:+51944555221',
      tone: 'phone',
      resolves: ['Problemas de presión', 'Fugas reportadas', 'Calidad del agua', 'Incidencias operativas', 'Validación de reportes', 'Casos en atención']
    },
    {
      title: 'WhatsApp general',
      description: 'Atención rápida',
      value: '+51 999 000 111',
      action: 'Abrir WhatsApp',
      href: 'https://wa.me/51999000111',
      tone: 'whatsapp',
      resolves: ['Estado de cuenta', 'Información general', 'Consultas rápidas', 'Actualización de datos', 'Orientación básica', 'Uso de la plataforma']
    },
    {
      title: 'WhatsApp soporte',
      description: 'Seguimiento de incidencias',
      value: '+51 944 555 221',
      action: 'Abrir WhatsApp',
      href: 'https://wa.me/51944555221',
      tone: 'whatsapp',
      resolves: ['Estado de reportes', 'Seguimiento de casos', 'Validación de incidencias', 'Soporte operativo', 'Casos en proceso', 'Información de atención']
    }
  ];

  readonly quickItems = [
    { label: 'Horario de atención', value: 'Lun - Sáb, 8:00 AM - 6:00 PM', tone: 'normal' },
    { label: 'Emergencias', value: 'Atención 24/7 casos críticos', tone: 'alert' },
    { label: 'Cobertura', value: 'Provincia de Lima', tone: 'normal' }
  ];
}
