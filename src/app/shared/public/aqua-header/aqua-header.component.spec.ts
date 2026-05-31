import { convertToParamMap } from '@angular/router';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AquaHeaderComponent } from './aqua-header.component';
import { AuthService, StoredSession } from '../../../core/api/auth.service';

describe('AquaHeaderComponent', () => {
  function createComponent() {
    const queryParamMap$ = new Subject<ReturnType<typeof convertToParamMap>>();
    const session = signal<StoredSession | null>(null);
    const route = {
      queryParamMap: queryParamMap$.asObservable(),
      snapshot: {
        queryParamMap: convertToParamMap({})
      }
    } as any;
    const router = {
      navigate: vi.fn()
    } as any;
    const auth = {
      session,
      logout: vi.fn()
    } as unknown as AuthService;

    const component = new AquaHeaderComponent(route, router, auth);
    component.ngOnInit();
    return { component, queryParamMap$, route, router, auth, session };
  }

  it('abre el modal de registro cuando la ruta trae auth=registro', () => {
    const { component, queryParamMap$ } = createComponent();

    queryParamMap$.next(convertToParamMap({ auth: 'registro' }));

    expect(component.authModalOpen).toBe(true);
    expect(component.authInitialView).toBe('register');
  });

  it('limpia el parámetro auth al cerrar el modal abierto por ruta', () => {
    const { component, route, router } = createComponent();
    route.snapshot.queryParamMap = convertToParamMap({ auth: 'registro' });
    component.authModalOpen = true;

    component.closeAuth();

    expect(component.authModalOpen).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { auth: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  it('muestra el nombre del usuario autenticado', () => {
    const { component, session } = createComponent();
    session.set({
      token: 'token',
      refreshToken: 'refresh',
      userId: 7,
      nombre: 'Kevin Espiritu',
      correo: 'kevin@test.local',
      rol: 'CIUDADANO'
    });

    expect(component.userDisplayName()).toBe('Kevin Espiritu');
    expect(component.userInitials()).toBe('KE');
  });

  it('usa dos letras cuando el nombre solo tiene una palabra', () => {
    const { component, session } = createComponent();
    session.set({
      token: 'token',
      refreshToken: 'refresh',
      userId: 8,
      nombre: 'Kevin',
      correo: 'kevin@test.local',
      rol: 'CIUDADANO'
    });

    expect(component.userInitials()).toBe('KE');
  });

  it('cierra sesión desde el header', () => {
    const { component, auth } = createComponent();

    component.logout();

    expect(auth.logout).toHaveBeenCalled();
  });
});
