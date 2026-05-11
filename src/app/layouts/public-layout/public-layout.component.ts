import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthModalComponent } from '../../shared/auth-modal/auth-modal.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, AuthModalComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-on-background">
      <header class="bg-on-primary border-b border-outline-variant/40 sticky top-0 z-40">
        <div class="app-shell flex items-center justify-between gap-4 py-3">
          <a routerLink="/inicio" class="text-primary font-extrabold tracking-tight text-xl">AQUACOMUNIDAD</a>

          <nav class="hidden md:flex items-center gap-2 text-sm">
            <a routerLink="/inicio" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Inicio</a>
            <a routerLink="/estado-servicio" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Estado del servicio</a>
            <a routerLink="/reportar" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Reportar incidencia</a>
            <a routerLink="/mis-reportes" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Seguimiento</a>
            <a routerLink="/contacto" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Contacto</a>
          </nav>

          <button class="btn-primary" type="button" (click)="openAuth('login')">Iniciar sesión</button>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-primary text-on-primary border-t border-primary/80">
        <div class="app-shell py-10 grid gap-8 md:grid-cols-4 text-sm">
          <section>
            <h3 class="text-on-primary font-semibold mb-3">AQUACOMUNIDAD</h3>
            <p class="leading-relaxed text-on-primary/85">Plataforma comunitaria para reporte, monitoreo y seguimiento del servicio de agua.</p>
          </section>

          <section>
            <h3 class="text-on-primary font-semibold mb-3">Atención</h3>
            <ul class="space-y-1 text-on-primary/85">
              <li>Lun - Sáb: 8:00 a 18:00</li>
              <li>Domingos: Emergencias</li>
              <li>Tiempo promedio: 4.9h</li>
            </ul>
          </section>

          <section>
            <h3 class="text-on-primary font-semibold mb-3">Contacto</h3>
            <ul class="space-y-1 text-on-primary/85">
              <li>+51 999 000 111</li>
              <li>+51 944 555 221</li>
              <li class="break-all">soporte@aquacomunidad.pe</li>
            </ul>
          </section>

          <section>
            <h3 class="text-on-primary font-semibold mb-3">Enlaces</h3>
            <ul class="space-y-1 text-on-primary/85">
              <li><a routerLink="/reportar" class="hover:text-secondary">Reportar incidencia</a></li>
              <li><a routerLink="/mis-reportes" class="hover:text-secondary">Seguimiento</a></li>
              <li><button type="button" class="hover:text-secondary text-left" (click)="openAuth('login')">Acceso operadores</button></li>
            </ul>
          </section>
        </div>

        <div class="border-t border-on-primary/20">
          <div class="app-shell py-4 text-xs text-on-primary/70 flex flex-wrap gap-2 justify-between">
            <span>© 2026 AQUACOMUNIDAD. Todos los derechos reservados.</span>
            <span>Versión piloto comunitaria</span>
          </div>
        </div>
      </footer>

      <app-auth-modal
        *ngIf="authOpen"
        [initialView]="authView"
        (closed)="closeAuth()"
      />
    </div>
  `
})
export class PublicLayoutComponent {
  authOpen = false;
  authView: 'login' | 'register' | 'recover' = 'login';

  openAuth(view: 'login' | 'register' | 'recover'): void {
    this.authView = view;
    this.authOpen = true;
  }

  closeAuth(): void {
    this.authOpen = false;
  }
}
