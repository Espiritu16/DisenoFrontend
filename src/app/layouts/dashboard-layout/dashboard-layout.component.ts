import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { AquaLogoComponent } from '../../shared/public/aqua-logo/aqua-logo.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AquaLogoComponent],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar" [class.open]="menuOpen">
        <a class="admin-brand" routerLink="/administrador/dashboard" (click)="closeMenuOnMobile()">
          <app-aqua-logo size="sm"></app-aqua-logo>
          <div>
            <strong>AquaComunidad</strong>
            <small>Centro operativo</small>
          </div>
        </a>

        <nav class="nav-links">
          <a routerLink="/administrador/dashboard" routerLinkActive="active-link" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">space_dashboard</span>
            <span>Resumen</span>
          </a>
          <a routerLink="/administrador/atencion-casos" routerLinkActive="active-link" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">assignment</span>
            <span>Atención de casos</span>
          </a>
          <a routerLink="/administrador/reportes" routerLinkActive="active-link" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">forum</span>
            <span>Reportes ciudadanos</span>
          </a>
          <a routerLink="/administrador/gestion-usuarios" routerLinkActive="active-link" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">group</span>
            <span>Gestión de usuarios</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/inicio" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">home</span>
            <span>Ir a inicio</span>
          </a>
          <a routerLink="/inicio" (click)="auth.logout(); closeMenuOnMobile()">
            <span class="material-symbols-outlined">logout</span>
            <span>Cerrar sesión</span>
          </a>
        </div>
      </aside>

      <div class="admin-backdrop" *ngIf="menuOpen" (click)="menuOpen = false"></div>

      <div class="admin-main">
        <header class="admin-topbar">
          <button class="menu-btn" (click)="menuOpen = !menuOpen" aria-label="Abrir menú">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="topbar-copy">
            <span class="topbar-kicker">Panel administrativo</span>
            <strong>Operación AquaComunidad</strong>
          </div>
          <span class="admin-user-name">{{ userDisplayName }}</span>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout { height: 100vh; overflow: hidden; display: grid; grid-template-columns: 280px 1fr; background: #f7f9fd; }
      .admin-sidebar { height: 100vh; min-height: 0; overflow-y: auto; background: #ffffff; color: var(--color-text-main); padding: 1.1rem .9rem; display: flex; flex-direction: column; gap: 1rem; border-right: 1px solid #dbe4f0; box-shadow: 18px 0 45px rgba(15, 23, 42, .035); }
      .admin-brand { display:flex; align-items:center; gap:.65rem; text-decoration:none; color:var(--color-text-main); padding:.2rem .35rem 1rem; border-bottom:1px solid #e4ebf5;}
      .admin-brand strong { display:block; font-family:'Hanken Grotesk', Inter, sans-serif; font-weight:900; font-size:1.02rem; letter-spacing:0; color:#0b1224; }
      .admin-brand small { display:block; font-size:.72rem; letter-spacing:.02em; color:#64748b; font-weight:800; margin-top: .1rem; }
      .nav-links { display: grid; gap: .45rem; }
      .nav-links a { min-height: 44px; display:flex; align-items:center; gap:.7rem; color: #334155; padding: .62rem .72rem; border-radius: .5rem; text-decoration: none; font-size: .9rem; border:1px solid transparent; font-weight:800; transition: background .18s ease, border-color .18s ease, color .18s ease;}
      .nav-links a .material-symbols-outlined { width: 24px; height: 24px; display:grid; place-items:center; font-size: 19px; color:#2563eb; }
      .nav-links a:hover { background: #f4f7ff; border-color: #dbe7ff; color: #0f172a; }
      .active-link { background: #eff5ff !important; color: #0b1224 !important; border-color:#bcd3ff !important; box-shadow: inset 3px 0 0 #2563eb; }
      .sidebar-footer { margin-top: auto; display: grid; gap: .45rem; padding-top: .9rem; border-top: 1px solid #e4ebf5; }
      .sidebar-footer a { min-height: 42px; display:flex; align-items:center; gap:.55rem; color: #334155; text-decoration: none; padding: .52rem .62rem; border-radius: .5rem; font-size: .86rem; border:1px solid #dbe4f0; font-weight:800; background:#fff;}
      .sidebar-footer a .material-symbols-outlined { font-size: 18px; color:#2563eb; }
      .sidebar-footer a:hover { background: #f4f7ff; border-color: #bcd3ff; }
      .admin-main { min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
      .admin-topbar { min-height: 68px; display: flex; align-items: center; gap: .8rem; padding: 0 clamp(1rem, 2vw, 1.6rem); border-bottom: 1px solid #dbe4f0; background: rgba(255,255,255,.92); color: #0b1224; font-weight: 800; backdrop-filter: blur(12px); }
      .topbar-copy { display:grid; gap:.12rem; min-width:0; }
      .topbar-copy strong { font-size: .98rem; white-space: nowrap; overflow:hidden; text-overflow:ellipsis; }
      .topbar-kicker { font-size:.72rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
      .admin-user-name { margin-left: auto; min-width: 0; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; color:#334155; border:1px solid #dbe4f0; padding:.55rem .75rem; border-radius:999px; background:#fff; }
      .menu-btn { display: none; min-height: 44px; min-width:44px; border: 1px solid #dbe4f0; background: #ffffff; color: #2563eb; border-radius: .5rem; padding: .35rem .65rem; }
      .menu-btn:hover { border-color: #bcd3ff; color: #1d4ed8; background: #f4f7ff; }
      .menu-btn .material-symbols-outlined { font-size: 20px; }
      .admin-content { flex: 1 1 auto; min-height: 0; overflow: auto; padding: clamp(1rem, 2vw, 1.5rem); background:
        linear-gradient(180deg, rgba(239,245,255,.7), rgba(247,249,253,0) 320px),
        #f7f9fd; }
      .admin-content .app-shell { width: 100%; max-width: none; margin: 0; padding-left: 0; padding-right: 0; }
      .admin-backdrop { display: none; }

      @media (max-width: 960px) {
        .admin-layout { grid-template-columns: 1fr; }
        .admin-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 270px; z-index: 70;
          transform: translateX(-100%); transition: transform .2s ease;
        }
        .admin-sidebar.open { transform: translateX(0); }
        .admin-backdrop { position: fixed; inset: 0; z-index: 60; display: block; background: rgba(15, 23, 42, 0.35); }
        .menu-btn { display: inline-block; }
        .admin-content { padding: .85rem; }
      }

      @media (max-width: 640px) {
        .admin-topbar { min-height: 58px; padding: 0 .75rem; }
        .topbar-kicker { display:none; }
        .topbar-copy strong { font-size: .9rem; }
        .admin-user-name { max-width: 140px; padding:.45rem .6rem; }
        .admin-content { padding: .7rem; }
        .admin-sidebar { width: min(280px, calc(100vw - .75rem)); }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  menuOpen = false;

  constructor(public auth: AuthService) {}

  get userDisplayName(): string {
    const session = this.auth.session();
    return session?.nombre?.trim() || session?.correo || 'Administrador';
  }

  closeMenuOnMobile(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
      this.menuOpen = false;
    }
  }
}
