import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthModalComponent } from '../../shared/auth-modal/auth-modal.component';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, AuthModalComponent],
  template: `
    <div class="site-wrap min-h-screen flex flex-col bg-background text-on-background">
      <header class="site-header sticky top-0 z-40 bg-on-primary border-b border-outline-variant/40">
        <div class="app-shell site-header__inner">
          <button class="site-header__menu-btn" type="button" aria-label="Abrir menú" (click)="toggleMobileMenu()">
            <span class="material-symbols-outlined">menu</span>
          </button>

          <a routerLink="/inicio" class="site-header__brand text-primary font-extrabold tracking-tight text-xl" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined site-header__brand-icon" aria-hidden="true">water_drop</span>
            <span>AQUACOMUNIDAD</span>
          </a>

          <nav class="site-header__nav" aria-label="Navegación principal">
            <a routerLink="/inicio" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Inicio</a>
            <a routerLink="/reportar" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Reportar incidencia</a>
            <a routerLink="/mis-reportes" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Seguimiento</a>
            <a routerLink="/contacto" class="px-3 py-2 rounded-md hover:bg-surface-container-low">Contacto</a>
          </nav>

          <div class="site-header__actions">
            <a *ngIf="auth.role === 'ADMIN' || auth.role === 'OPERADOR'" routerLink="/administrador/dashboard" class="btn-secondary site-header__admin">Administrador</a>
            <button *ngIf="!auth.session()" class="btn-primary site-header__login" type="button" (click)="openAuth('login')">Iniciar sesión</button>
            <button *ngIf="auth.session()" class="btn-primary site-header__login" type="button" (click)="auth.logout()">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div class="site-drawer-backdrop" *ngIf="isMobileMenuOpen" (click)="closeMobileMenu()">
        <aside class="site-drawer" role="dialog" aria-modal="true" aria-label="Menú principal móvil" (click)="$event.stopPropagation()">
          <div class="site-drawer__head">
            <strong>Menú</strong>
            <button type="button" aria-label="Cerrar menú" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav class="site-drawer__nav" aria-label="Navegación principal móvil">
            <a routerLink="/inicio" (click)="closeMobileMenu()">Inicio</a>
            <a routerLink="/reportar" (click)="closeMobileMenu()">Reportar incidencia</a>
            <a routerLink="/mis-reportes" (click)="closeMobileMenu()">Seguimiento</a>
            <a routerLink="/contacto" (click)="closeMobileMenu()">Contacto</a>
          </nav>
          <button class="btn-primary site-drawer__login" type="button" (click)="openAuth('login'); closeMobileMenu()">
            Iniciar sesión
          </button>
        </aside>
      </div>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="site-footer bg-primary text-on-primary border-t border-primary/80">
        <div class="app-shell site-footer__grid text-sm">
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
          <div class="app-shell site-footer__legal text-xs text-on-primary/70">
            <span>© 2026 AQUACOMUNIDAD. Todos los derechos reservados.</span>
            <span>Versión piloto comunitaria</span>
          </div>
        </div>
      </footer>

      <app-auth-modal *ngIf="authOpen" [initialView]="authView" (closed)="closeAuth()" />
    </div>
  `,
  styles: [
    `
      .site-wrap {
        max-width: 100%;
        overflow-x: clip;
      }

      .site-header {
        overflow: visible;
      }

      .site-header__inner {
        width: 100%;
        max-width: none;
        min-height: 68px;
        display: grid;
        grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
        align-items: center;
        margin: 0;
        padding: 0.85rem clamp(1.25rem, 3.5vw, 4rem);
        gap: 0.85rem;
      }

      .site-header__brand {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        text-decoration: none;
        white-space: nowrap;
      }

      .site-header__brand-icon {
        font-size: 1.55rem;
        line-height: 1;
      }

      .site-header__nav {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.875rem;
        justify-self: center;
      }

      .site-header__login {
        white-space: nowrap;
      }

      .site-header__actions {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        justify-self: end;
      }

      .site-header__admin {
        white-space: nowrap;
        text-decoration: none;
      }

      .site-header__menu-btn {
        display: none;
        border: 0;
        background: transparent;
        color: var(--color-brand-primary);
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }

      .site-header__menu-btn .material-symbols-outlined {
        font-size: 24px;
      }

      .site-drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.35);
        z-index: 55;
      }

      .site-drawer {
        width: min(320px, calc(100vw - 1.5rem));
        height: 100%;
        background: var(--color-on-brand);
        border-right: 1px solid var(--color-border);
        box-shadow: 0 18px 42px rgba(15, 23, 42, 0.2);
        padding: 0.9rem 0.8rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        animation: drawer-in 0.2s ease;
      }

      .site-drawer__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--color-brand-primary);
      }

      .site-drawer__head button {
        border: 0;
        background: transparent;
        color: var(--color-brand-primary);
      }

      .site-drawer__nav {
        display: grid;
        gap: 0.3rem;
      }

      .site-drawer__nav a {
        border: 1px solid var(--color-border);
        border-radius: 0.6rem;
        padding: 0.66rem 0.72rem;
        color: var(--color-text-main);
        text-decoration: none;
        font-weight: 600;
      }

      .site-drawer__login {
        margin-top: auto;
      }

      .site-footer__grid {
        padding-top: 2.4rem;
        padding-bottom: 2.4rem;
        display: grid;
        gap: 2rem;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .site-footer__legal {
        padding-top: 1rem;
        padding-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.55rem;
        flex-wrap: wrap;
      }

      @keyframes drawer-in {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }

      @media (max-width: 960px) {
        .site-header__inner {
          min-height: 58px;
          display: flex;
          flex-wrap: wrap;
          row-gap: 0.55rem;
          padding: 0.7rem 0.9rem;
        }

        .site-header__menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .site-header__nav {
          display: none;
        }

        .site-header__actions {
          margin-left: auto;
          gap: 0.4rem;
        }

        .site-header__login,
        .site-header__admin {
          min-height: 36px;
          padding: 0.45rem 0.68rem;
          font-size: 0.86rem;
        }

        .site-footer__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.4rem;
        }
      }

      @media (max-width: 640px) {
        .site-header__brand {
          font-size: 1rem;
        }

        .site-header__login {
          font-size: 0.78rem;
          padding: 0.42rem 0.6rem;
        }

        .site-footer__grid {
          grid-template-columns: 1fr;
          text-align: center;
          gap: 1rem;
        }

        .site-footer__legal {
          justify-content: center;
          text-align: center;
          flex-direction: column;
        }
      }
    `
  ]
})
export class PublicLayoutComponent {
  authOpen = false;
  authView: 'login' | 'register' | 'recover' = 'login';
  isMobileMenuOpen = false;

  constructor(public auth: AuthService) {}

  openAuth(view: 'login' | 'register' | 'recover'): void {
    this.authView = view;
    this.authOpen = true;
  }

  closeAuth(): void {
    this.authOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
