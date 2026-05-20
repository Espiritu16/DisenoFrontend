import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar" [class.open]="menuOpen">
        <a class="admin-brand" routerLink="/administrador/dashboard" (click)="closeMenuOnMobile()">
          <span class="material-symbols-outlined">water_drop</span>
          <div>
            <strong>AQUACOMUNIDAD</strong>
            <small>Panel Administrador</small>
          </div>
        </a>

        <nav class="nav-links">
          <a routerLink="/administrador/dashboard" routerLinkActive="active-link" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">space_dashboard</span>
            <span>Dashboard</span>
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
          <a routerLink="/inicio" (click)="closeMenuOnMobile()">
            <span class="material-symbols-outlined">logout</span>
            <span>Cerrar sesión</span>
          </a>
        </div>
      </aside>

      <div class="admin-backdrop" *ngIf="menuOpen" (click)="menuOpen = false"></div>

      <div class="admin-main">
        <header class="admin-topbar">
          <button class="menu-btn" (click)="menuOpen = !menuOpen" aria-label="Abrir menú">☰</button>
          <span>Administrador</span>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout { min-height: 100vh; display: grid; grid-template-columns: 290px 1fr; background: var(--color-bg-main); }
      .admin-sidebar { background: var(--color-brand-primary); color: var(--color-on-brand); padding: 1rem .9rem; display: flex; flex-direction: column; gap: .75rem; }
      .admin-brand { display:flex; align-items:center; gap:.55rem; text-decoration:none; color:var(--color-on-brand); padding:.25rem .35rem .9rem; border-bottom:1px solid rgba(255,255,255,.24);}
      .admin-brand .material-symbols-outlined { font-size: 26px; }
      .admin-brand strong { display:block; font-weight:800; font-size:1rem; letter-spacing:.03em; }
      .admin-brand small { display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; opacity:.9; }
      .nav-links { display: grid; gap: .35rem; }
      .nav-links a { display:flex; align-items:center; gap:.55rem; color: rgba(255,255,255,.86); padding: .62rem .72rem; border-radius: .7rem; text-decoration: none; font-size: .89rem; border:1px solid transparent; font-weight:600;}
      .nav-links a .material-symbols-outlined { font-size: 19px; }
      .nav-links a:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.2); }
      .active-link { background: var(--color-on-brand); color: var(--color-brand-primary) !important; border-color:var(--color-on-brand); font-weight: 700; }
      .sidebar-footer { margin-top: auto; display: grid; gap: .4rem; padding-top: .9rem; }
      .sidebar-footer a { display:flex; align-items:center; gap:.4rem; color: rgba(255,255,255,.86); text-decoration: none; padding: .52rem .62rem; border-radius: .62rem; font-size: .86rem; border:1px solid rgba(255,255,255,.28);}
      .sidebar-footer a .material-symbols-outlined { font-size: 18px; }
      .sidebar-footer a:hover { background: rgba(255,255,255,.08); }
      .admin-main { min-width: 0; }
      .admin-topbar { height: 56px; display: flex; align-items: center; gap: .8rem; padding: 0 1rem; border-bottom: 1px solid var(--color-border); background: var(--color-on-brand); color: var(--color-brand-primary); font-weight: 700; }
      .menu-btn { display: none; border: 0; background: rgba(0,229,255,.16); color: var(--color-brand-primary); border-radius: .5rem; padding: .35rem .55rem; }
      .admin-content { padding: 1rem 1.2rem; }
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
        .admin-topbar { height: 52px; padding: 0 .75rem; }
        .admin-content { padding: .7rem; }
        .admin-sidebar { width: min(280px, calc(100vw - .75rem)); }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  menuOpen = false;

  closeMenuOnMobile(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
      this.menuOpen = false;
    }
  }
}
