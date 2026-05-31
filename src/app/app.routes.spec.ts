import { routes } from './app.routes';

describe('routes', () => {
  it('expone la vista publica de inicio', () => {
    const inicioRoute = routes.find((route) => route.path === 'inicio');

    expect(inicioRoute).toBeTruthy();
    expect(inicioRoute?.loadComponent).toBeTruthy();
  });

  it('expone la vista publica de reportar', () => {
    const reportarRoute = routes.find((route) => route.path === 'reportar');

    expect(reportarRoute).toBeTruthy();
    expect(reportarRoute?.loadComponent).toBeTruthy();
  });
});
