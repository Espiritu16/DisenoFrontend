import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, StoredSession } from '../../../core/api/auth.service';
import { AuthModalComponent } from '../../auth-modal/auth-modal.component';
import { AquaLogoComponent } from '../aqua-logo/aqua-logo.component';

interface AquaNavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-aqua-header',
  standalone: true,
  imports: [CommonModule, RouterLink, AquaLogoComponent, AuthModalComponent],
  templateUrl: './aqua-header.component.html',
  styleUrl: './aqua-header.component.css'
})
export class AquaHeaderComponent implements OnInit, OnDestroy {
  @Input() reportHref = '/reportar';
  @Input() reportsHref = '/mis-reportes';
  @Input() contactHref = '/contacto';
  @Input() activeHref = '/inicio';
  authModalOpen = false;
  authInitialView: 'login' | 'register' = 'login';
  readonly session = computed(() => this.currentSession());
  readonly userDisplayName = computed(() => {
    const session = this.session();
    if (!session) {
      return '';
    }
    return session.nombre?.trim() || session.correo.split('@')[0] || 'Usuario';
  });
  readonly userInitials = computed(() => this.initialsFromName(this.userDisplayName()));
  private readonly destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router, readonly auth: AuthService) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const authView = params.get('auth');
        if (authView === 'registro' || authView === 'register') {
          this.openAuth('register');
          return;
        }
        if (authView === 'login' || authView === 'acceder') {
          this.openAuth('login');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get navLinks(): AquaNavLink[] {
    return [
      { label: 'Inicio', href: '/inicio' },
      { label: 'Reportar', href: this.reportHref },
      { label: 'Mis Reportes', href: this.reportsHref },
      { label: 'Estado del servicio', href: '/estado-servicio' },
      { label: 'Contacto', href: this.contactHref }
    ];
  }

  openAuth(view: 'login' | 'register' = 'login'): void {
    this.authInitialView = view;
    this.authModalOpen = true;
  }

  closeAuth(): void {
    this.authModalOpen = false;
    if (this.route.snapshot.queryParamMap.has('auth')) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { auth: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  logout(): void {
    this.auth.logout();
  }

  private initialsFromName(name: string): string {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) {
      return 'AC';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private currentSession(): StoredSession | null {
    const session = this.auth.session;
    return typeof session === 'function' ? session() : null;
  }
}
