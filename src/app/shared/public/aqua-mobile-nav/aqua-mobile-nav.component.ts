import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AquaMobileNavItem {
  label: string;
  href?: string;
  action?: 'chat';
  path: string;
}

@Component({
  selector: 'app-aqua-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aqua-mobile-nav.component.html',
  styleUrl: './aqua-mobile-nav.component.css'
})
export class AquaMobileNavComponent {
  @Input() activeHref = '/inicio';

  readonly navItems: AquaMobileNavItem[] = [
    {
      label: 'Inicio',
      href: '/inicio',
      path: 'M5 11.2 12 5l7 6.2V20a1 1 0 0 1-1 1h-4.2v-5.8h-3.6V21H6a1 1 0 0 1-1-1v-8.8Z'
    },
    {
      label: 'Reportar',
      href: '/reportar',
      path: 'M12 3.8c3.2 3.4 5 6.1 5 9a5 5 0 0 1-10 0c0-2.9 1.8-5.6 5-9Zm-2.4 9.4a2.4 2.4 0 0 0 4.8 0'
    },
    {
      label: 'Reportes',
      href: '/mis-reportes',
      path: 'M6 4.5h12v15H6v-15Zm3 4h6M9 12h6M9 15.5h4'
    },
    {
      label: 'Servicio',
      href: '/estado-servicio',
      path: 'M12 3.8c3.2 3.4 5 6.1 5 9a5 5 0 0 1-10 0c0-2.9 1.8-5.6 5-9Zm-3.2 9.5h6.4M10 16h4'
    },
    {
      label: 'Contacto',
      href: '/contacto',
      path: 'M5 6.5h14v9H9l-4 3v-12Zm4 4h6'
    },
    {
      label: 'Ayuda',
      action: 'chat',
      path: 'M12 4.6c4.3 0 7.8 2.9 7.8 6.6s-3.5 6.6-7.8 6.6c-.9 0-1.8-.1-2.6-.4L5 19.2l1.3-3.7a5.8 5.8 0 0 1-2.1-4.3c0-3.7 3.5-6.6 7.8-6.6Zm-3 6.6h.1m2.9 0h.1m2.9 0h.1'
    }
  ];

  isActive(item: AquaMobileNavItem): boolean {
    return Boolean(item.href && this.activeHref === item.href);
  }

  openChat(event?: Event): void {
    event?.preventDefault();
    window.dispatchEvent(new CustomEvent('aqua-chatbot-open'));
  }
}
