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

  it('expone el wireframe de inicio ciudadano logueado', () => {
    const wireframeRoute = routes.find((route) => route.path === 'wireframe');
    const inicioWireframeRoute = wireframeRoute?.children?.find((route) => route.path === 'inicio');

    expect(wireframeRoute).toBeTruthy();
    expect(inicioWireframeRoute).toBeTruthy();
    expect(inicioWireframeRoute?.loadComponent).toBeTruthy();
  });

  it('expone el wireframe de mis reportes ciudadano logueado', () => {
    const wireframeRoute = routes.find((route) => route.path === 'wireframe');
    const reportesWireframeRoute = wireframeRoute?.children?.find((route) => route.path === 'mis-reportes');

    expect(wireframeRoute).toBeTruthy();
    expect(reportesWireframeRoute).toBeTruthy();
    expect(reportesWireframeRoute?.loadComponent).toBeTruthy();
  });

  it('expone el wireframe de reportar ciudadano logueado', () => {
    const wireframeRoute = routes.find((route) => route.path === 'wireframe');
    const reportarWireframeRoute = wireframeRoute?.children?.find((route) => route.path === 'reportar');

    expect(wireframeRoute).toBeTruthy();
    expect(reportarWireframeRoute).toBeTruthy();
    expect(reportarWireframeRoute?.loadComponent).toBeTruthy();
  });

  it('expone el wireframe de contacto ciudadano logueado', () => {
    const wireframeRoute = routes.find((route) => route.path === 'wireframe');
    const contactoWireframeRoute = wireframeRoute?.children?.find((route) => route.path === 'contacto');

    expect(wireframeRoute).toBeTruthy();
    expect(contactoWireframeRoute).toBeTruthy();
    expect(contactoWireframeRoute?.loadComponent).toBeTruthy();
  });
});
