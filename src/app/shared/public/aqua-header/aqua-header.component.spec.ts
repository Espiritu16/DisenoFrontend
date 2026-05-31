import { convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { AquaHeaderComponent } from './aqua-header.component';

describe('AquaHeaderComponent', () => {
  function createComponent() {
    const queryParamMap$ = new Subject<ReturnType<typeof convertToParamMap>>();
    const route = {
      queryParamMap: queryParamMap$.asObservable(),
      snapshot: {
        queryParamMap: convertToParamMap({})
      }
    } as any;
    const router = {
      navigate: vi.fn()
    } as any;

    const component = new AquaHeaderComponent(route, router);
    component.ngOnInit();
    return { component, queryParamMap$, route, router };
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
});
