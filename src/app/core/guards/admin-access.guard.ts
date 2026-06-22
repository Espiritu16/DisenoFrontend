import { inject } from '@angular/core';
import { CanActivateChildFn, CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../api/auth.service';
import { environment } from '../../../environments/environment';

function hasAdminAccess(segments: UrlSegment[] = []): boolean {
  if (environment.allowAdminRoutesWithoutLogin) {
    return true;
  }
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.role;
  const target = '/' + segments.map((s) => s.path).join('/');
  if (role === 'AUTORIDAD' && (target.includes('gestion-usuarios') || target.includes('estado-servicio'))) {
    void router.navigate(['/administrador/dashboard']);
    return false;
  }
  const autorizado = role === 'ADMIN' || role === 'OPERADOR' || role === 'AUTORIDAD';
  if (autorizado) {
    return true;
  }
  void router.navigate(['/inicio'], { queryParams: { denied: target || '/administrador' } });
  return false;
}

export const adminCanMatchGuard: CanMatchFn = (_route, segments) => hasAdminAccess(segments);

export const adminCanActivateChildGuard: CanActivateChildFn = (route) => {
  const first = route.url?.map((s) => s.path) ?? [];
  const segments = first.map((p) => ({ path: p } as UrlSegment));
  return hasAdminAccess(segments);
};
