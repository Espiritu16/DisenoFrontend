import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthModalComponent } from '../../shared/auth-modal/auth-modal.component';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AuthModalComponent],
  template: `
    <div class="site-wrap min-h-screen flex flex-col bg-background text-on-background font-body-md text-body-md">
      <header class="site-header">
        <div class="site-header__inner">
          <button class="site-header__menu-btn" type="button" aria-label="Abrir menú" (click)="toggleMobileMenu()">
            <span class="material-symbols-outlined">menu</span>
          </button>

          <a routerLink="/inicio" class="site-header__brand" (click)="closeMobileMenu()">
            <span class="site-header__brand-mark" aria-hidden="true">
              <span class="material-symbols-outlined">water_drop</span>
            </span>
            <span class="site-header__brand-text">AQUACOMUNIDAD</span>
          </a>

          <nav class="site-header__nav" aria-label="Navegación principal">
            <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
            <a routerLink="/reportar" routerLinkActive="active">Reportar</a>
            <a *ngIf="auth.session(); else headerReportsLogin" routerLink="/mis-reportes" routerLinkActive="active">Mis reportes</a>
            <ng-template #headerReportsLogin>
              <button class="site-header__nav-link" type="button" (click)="openAuth('login')">Mis reportes</button>
            </ng-template>
            <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
          </nav>

          <div class="site-header__actions">
            <a *ngIf="auth.role === 'ADMIN' || auth.role === 'OPERADOR'" routerLink="/administrador/dashboard" class="btn-secondary site-header__admin">Administrador</a>
            <button *ngIf="!auth.session()" class="btn-primary site-header__login" type="button" (click)="openAuth('login')">Acceso</button>
            <ng-container *ngIf="auth.session()">
              <div class="site-header__user" title="Usuario conectado">
                <span class="material-symbols-outlined" aria-hidden="true">person</span>
                <span class="site-header__user-name">{{ userDisplayName }}</span>
              </div>
              <button class="btn-primary site-header__login" type="button" (click)="auth.logout()">Cerrar sesión</button>
            </ng-container>
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
            <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined" aria-hidden="true">home</span>
              Inicio
            </a>
            <a routerLink="/reportar" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined" aria-hidden="true">campaign</span>
              Reportar
            </a>
            <a *ngIf="auth.session(); else drawerReportsLogin" routerLink="/mis-reportes" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined" aria-hidden="true">query_stats</span>
              Mis reportes
            </a>
            <ng-template #drawerReportsLogin>
              <button class="site-drawer__nav-link" type="button" (click)="openAuth('login'); closeMobileMenu()">
                <span class="material-symbols-outlined" aria-hidden="true">query_stats</span>
                Mis reportes
              </button>
            </ng-template>
            <a routerLink="/contacto" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined" aria-hidden="true">support_agent</span>
              Contacto
            </a>
          </nav>
          <button class="btn-primary site-drawer__login" type="button" (click)="openAuth('login'); closeMobileMenu()">
            Acceso
          </button>
        </aside>
      </div>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="site-footer">
        <div class="site-footer__inner">
          <div class="site-footer__grid">
          <section class="site-footer__brand-col">
            <h3>AQUACOMUNIDAD</h3>
            <p>Plataforma GovTech para la gestión comunitaria e institucional de los servicios de agua.</p>
          </section>

          <section>
            <h3>Enlaces rápidos</h3>
            <ul>
              <li><a routerLink="/inicio">Inicio</a></li>
              <li><a routerLink="/reportar">Reportar incidencia</a></li>
              <li><a routerLink="/mis-reportes">Mis reportes</a></li>
            </ul>
          </section>

          <section>
            <h3>Información</h3>
            <ul>
              <li><a routerLink="/contacto">Contacto</a></li>
              <li><span>Transparencia operativa</span></li>
              <li><span>Atención ciudadana</span></li>
            </ul>
          </section>

          <section>
            <h3>Compromiso institucional</h3>
            <p>Trabajamos con autoridades y ciudadanos para asegurar un servicio eficiente, transparente y confiable.</p>
          </section>
          </div>

          <div class="site-footer__legal">
            <span>© 2026 AQUACOMUNIDAD. Todos los derechos reservados.</span>
            <span><span class="material-symbols-outlined" aria-hidden="true">security</span> Sistema seguro</span>
            <span><span class="material-symbols-outlined" aria-hidden="true">public</span> Portal ciudadano</span>
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
        position: sticky;
        top: 0;
        z-index: 50;
        overflow: visible;
        background: rgba(248, 249, 250, 0.95);
        border-bottom: 1px solid color-mix(in oklab, var(--color-border) 70%, transparent);
        box-shadow: 0 1px 10px rgba(0, 30, 64, 0.06);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      .site-header__inner {
        width: 100%;
        max-width: 1440px;
        min-height: 64px;
        display: grid;
        grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
        align-items: center;
        margin: 0 auto;
        padding: 0 16px;
        gap: 1rem;
      }

      .site-header__brand {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        text-decoration: none;
        white-space: nowrap;
        color: var(--color-brand-primary);
      }

      .site-header__brand-mark {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.85rem;
        display: grid;
        place-items: center;
        color: var(--color-on-brand);
        background: linear-gradient(135deg, var(--color-brand-primary), #0060ac);
        box-shadow: 0 10px 24px rgba(0, 51, 102, 0.18);
      }

      .site-header__brand-mark .material-symbols-outlined {
        font-size: 1.3rem;
        font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
      }

      .site-header__brand-text {
        font-family: 'Hanken Grotesk', Inter, sans-serif;
        font-size: 1.24rem;
        line-height: 1;
        font-weight: 800;
        letter-spacing: -0.01em;
      }

      .site-header__nav {
        display: flex;
        align-items: center;
        gap: 2rem;
        height: 100%;
        font-size: 0.88rem;
        justify-self: center;
      }

      .site-header__nav a {
        height: 64px;
        display: inline-flex;
        align-items: center;
        border-bottom: 2px solid transparent;
        color: var(--color-text-muted);
        font-weight: 650;
        text-decoration: none;
        transition: color 0.2s ease, border-color 0.2s ease;
      }

      .site-header__nav-link {
        height: 64px;
        display: inline-flex;
        align-items: center;
        border: 0;
        border-bottom: 2px solid transparent;
        padding: 0;
        color: var(--color-text-muted);
        background: transparent;
        font: inherit;
        font-weight: 650;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease;
      }

      .site-header__nav a:hover,
      .site-header__nav a.active,
      .site-header__nav-link:hover {
        color: #0060ac;
        border-bottom-color: #0060ac;
      }

      .site-header__login {
        white-space: nowrap;
        min-height: 2.625rem;
        border-radius: 0.25rem;
        padding-inline: 1.05rem;
      }

      .site-header__actions {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        justify-self: end;
      }

      .site-header__user {
        min-width: 0;
        max-width: 240px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.5rem 0.7rem;
        border: 1px solid color-mix(in oklab, var(--color-brand-primary) 18%, var(--color-border));
        border-radius: 0.5rem;
        color: var(--color-brand-primary);
        background: color-mix(in oklab, var(--color-brand-primary) 5%, var(--color-on-brand));
        font-weight: 700;
        font-size: 0.86rem;
      }

      .site-header__user .material-symbols-outlined {
        flex: 0 0 auto;
        font-size: 1.15rem;
      }

      .site-header__user-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        background: rgba(15, 23, 42, 0.42);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 55;
      }

      .site-drawer {
        width: min(320px, calc(100vw - 1.5rem));
        height: 100%;
        background: var(--color-on-brand);
        border-right: 1px solid var(--color-border);
        box-shadow: 0 24px 64px rgba(0, 30, 64, 0.2);
        padding: 1rem 0.9rem;
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
        border-radius: 0.85rem;
        padding: 0.78rem 0.82rem;
        color: var(--color-text-main);
        text-decoration: none;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        background: var(--color-on-brand);
      }

      .site-drawer__nav-link {
        width: 100%;
        border: 1px solid var(--color-border);
        border-radius: 0.85rem;
        padding: 0.78rem 0.82rem;
        color: var(--color-text-main);
        background: var(--color-on-brand);
        font: inherit;
        font-weight: 700;
        text-align: left;
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        cursor: pointer;
      }

      .site-drawer__nav a.active {
        border-color: color-mix(in oklab, #0060ac 35%, var(--color-border));
        color: #0060ac;
        background: color-mix(in oklab, #d4e3ff 72%, white);
      }

      .site-drawer__nav-link:hover {
        border-color: color-mix(in oklab, #0060ac 35%, var(--color-border));
        color: #0060ac;
        background: color-mix(in oklab, #d4e3ff 72%, white);
      }

      .site-drawer__login {
        margin-top: auto;
      }

      .site-footer {
        margin-top: auto;
        color: #d1e4fb;
        background: #233547;
        border-top: 1px solid rgba(195, 198, 209, 0.28);
      }

      .site-footer__inner {
        width: min(1440px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 4rem 0 1.5rem;
      }

      .site-footer__grid {
        display: grid;
        gap: 3rem;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding-bottom: 3rem;
        border-bottom: 1px solid rgba(195, 198, 209, 0.28);
      }

      .site-footer h3 {
        margin: 0 0 1rem;
        color: #ffffff;
        font-size: 0.9rem;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .site-footer__brand-col h3 {
        font-family: 'Hanken Grotesk', Inter, sans-serif;
        font-size: 1.45rem;
        letter-spacing: -0.01em;
      }

      .site-footer p,
      .site-footer li,
      .site-footer a,
      .site-footer span {
        color: rgba(209, 228, 251, 0.82);
      }

      .site-footer p {
        margin: 0;
        max-width: 30rem;
        line-height: 1.65;
      }

      .site-footer ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.75rem;
      }

      .site-footer a {
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .site-footer a:hover {
        color: var(--color-brand-accent);
      }

      .site-footer__legal {
        padding-top: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        font-size: 0.78rem;
      }

      .site-footer__legal span {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }

      .site-footer__legal .material-symbols-outlined {
        font-size: 1rem;
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
          padding: 0.65rem 0.9rem;
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

        .site-header__user {
          max-width: min(220px, 42vw);
          min-height: 36px;
          padding: 0.45rem 0.62rem;
        }

        .site-footer__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 2rem;
        }
      }

      @media (max-width: 640px) {
        .site-header__brand {
          gap: 0.5rem;
        }

        .site-header__brand-mark {
          width: 2rem;
          height: 2rem;
          border-radius: 0.7rem;
        }

        .site-header__brand-text {
          font-size: 1rem;
        }

        .site-header__login {
          font-size: 0.78rem;
          padding: 0.42rem 0.6rem;
        }

        .site-header__user {
          max-width: min(180px, 44vw);
          font-size: 0.78rem;
        }

        .site-footer__grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
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

  get userDisplayName(): string {
    const session = this.auth.session();
    return session?.nombre?.trim() || session?.correo || 'Usuario';
  }

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
