import { AquaMobileNavComponent } from './aqua-mobile-nav.component';

describe('AquaMobileNavComponent', () => {
  it('marca como activo solo el enlace actual', () => {
    const component = new AquaMobileNavComponent();

    component.activeHref = '/reportar';
    const reportar = component.navItems.find((item) => item.href === '/reportar');
    const inicio = component.navItems.find((item) => item.href === '/inicio');

    expect(reportar && component.isActive(reportar)).toBe(true);
    expect(inicio && component.isActive(inicio)).toBe(false);
  });

  it('emite el evento para abrir ayuda desde la barra móvil', () => {
    const component = new AquaMobileNavComponent();
    const listener = vi.fn();

    window.addEventListener('aqua-chatbot-open', listener);
    component.openChat();
    window.removeEventListener('aqua-chatbot-open', listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
