import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../core/api/dashboard.service';

describe('DashboardComponent', () => {
  const dashboardService = {
    kpis: vi.fn()
  } as unknown as DashboardService;

  function createComponent() {
    return new DashboardComponent(dashboardService);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar kpis desde backend', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(of({
      reportesPendientes: 11,
      reportesEnProceso: 7,
      reportesResueltos: 20,
      casosAbiertos: 4
    }));

    const component = createComponent();
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.kpis.casosActivos).toBe(4);
    expect(component.kpis.reportesNuevos).toBe(11);
    expect(component.kpis.casosEnEspera).toBe(7);
  });

  it('debe manejar error de kpis', () => {
    vi.mocked((dashboardService as any).kpis).mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'fallo' } }))
    );

    const component = createComponent();
    component.cargarKpis();

    expect(component.loading).toBe(false);
    expect(component.error.length).toBeGreaterThan(0);
  });
});
