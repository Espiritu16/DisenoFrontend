import { ElementRef, NgZone } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ChatbotWidgetComponent } from './chatbot-widget.component';
import { ChatbotService } from '../../core/api/chatbot.service';
import { AuthService } from '../../core/api/auth.service';

describe('ChatbotWidgetComponent', () => {
  const storageKey = 'aquacomunidad.chatbot.invitado.v1';
  const componentesCreados: ChatbotWidgetComponent[] = [];

  const chatbotService = {
    enviarMensaje: vi.fn(),
    listarConversaciones: vi.fn(),
    obtenerHistorial: vi.fn()
  } as unknown as ChatbotService;

  const authService = {
    get token() {
      return null;
    }
  } as AuthService;

  const router = {
    navigateByUrl: vi.fn()
  } as unknown as Router;

  const ngZone = {
    run: vi.fn((callback: () => void) => callback())
  } as unknown as NgZone;

  function createComponent(host?: HTMLElement) {
    const component = new ChatbotWidgetComponent(
      chatbotService,
      authService,
      router,
      host ? new ElementRef(host) : undefined,
      ngZone
    );
    componentesCreados.push(component);
    return component;
  }

  function setViewportWidth(width: number): void {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width
    });
  }

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    vi.clearAllMocks();
    setViewportWidth(1440);
  });

  afterEach(() => {
    componentesCreados.splice(0).forEach((component) => component.ngOnDestroy());
    window.history.replaceState(null, '', '/');
  });

  it('conserva el chat invitado por día en localStorage', () => {
    vi.mocked((chatbotService as any).enviarMensaje).mockReturnValue(of({
      respuesta: 'Para registrarte presiona Registrarse en la cabecera.',
      proveedor: 'local',
      modelo: 'fallback',
      iaDisponible: false,
      persistido: false,
      acciones: [{ etiqueta: 'Registrarse', ruta: '/inicio?auth=registro' }]
    }));

    const primerWidget = createComponent();
    const input = document.createElement('input');
    const blur = vi.spyOn(input, 'blur');
    Object.defineProperty(primerWidget as any, 'messageInput', {
      value: new ElementRef(input)
    });
    primerWidget.toggleChat();
    primerWidget.draft = 'quiero registrarme';
    primerWidget.sendMessage();

    expect(blur).not.toHaveBeenCalled();

    const segundoWidget = createComponent();
    segundoWidget.toggleChat();

    expect(segundoWidget.messages()).toEqual(expect.arrayContaining([
      expect.objectContaining({ author: 'user', text: 'quiero registrarme' }),
      expect.objectContaining({ author: 'assistant', text: 'Para registrarte presiona Registrarse en la cabecera.' })
    ]));
    expect(segundoWidget.conversacionesVisibles()[0].totalMensajes).toBe(2);
  });

  it('desplaza el cuerpo del chat al final al enviar y recibir mensajes', () => {
    vi.useFakeTimers();
    vi.mocked((chatbotService as any).enviarMensaje).mockReturnValue(of({
      respuesta: 'El mapa sirve para marcar la ubicación exacta de la incidencia.',
      proveedor: 'openai',
      modelo: 'gpt-5-mini',
      iaDisponible: true,
      persistido: false,
      acciones: []
    }));
    const component = createComponent();
    const scroller = document.createElement('div');
    Object.defineProperty(scroller, 'scrollHeight', { value: 1800 });
    Object.defineProperty(component as any, 'messageScroller', {
      value: { nativeElement: scroller }
    });

    component.toggleChat();
    component.draft = 'en reportar incidencia veo un mapa para que sirve?';
    component.sendMessage();
    vi.runOnlyPendingTimers();

    expect(scroller.scrollTop).toBe(1800);
    vi.useRealTimers();
  });

  it('cierra el teclado al enviar mensajes en móvil o tablet', () => {
    setViewportWidth(768);
    vi.mocked((chatbotService as any).enviarMensaje).mockReturnValue(of({
      respuesta: 'Para reportar una incidencia presiona Ir a reportar.',
      proveedor: 'local',
      modelo: 'fallback',
      iaDisponible: false,
      persistido: false,
      acciones: []
    }));
    const component = createComponent();
    const input = document.createElement('input');
    const blur = vi.spyOn(input, 'blur');
    Object.defineProperty(component as any, 'messageInput', {
      value: new ElementRef(input)
    });

    component.toggleChat();
    component.draft = 'como reporto';
    component.sendMessage();

    expect(blur).toHaveBeenCalled();
  });

  it('redirige el scroll al cuerpo del chat solo cuando el puntero está sobre el widget', () => {
    const host = document.createElement('section');
    const header = document.createElement('div');
    host.appendChild(header);
    document.body.appendChild(host);
    const component = createComponent(host);
    const scroller = document.createElement('div');
    Object.defineProperty(scroller, 'clientHeight', { value: 320 });
    Object.defineProperty(component as any, 'messageScroller', {
      value: { nativeElement: scroller }
    });

    component.toggleChat();
    const event = new WheelEvent('wheel', {
      deltaY: 120,
      bubbles: true,
      cancelable: true
    });
    header.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(scroller.scrollTop).toBe(120);

    const outsideEvent = new WheelEvent('wheel', {
      deltaY: 90,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(outsideEvent);

    expect(outsideEvent.defaultPrevented).toBe(false);
    expect(scroller.scrollTop).toBe(120);

    host.remove();
  });

  it('abre el chat desde la acción móvil de ayuda', () => {
    const component = createComponent();

    component.ngOnInit();
    window.dispatchEvent(new CustomEvent('aqua-chatbot-open'));

    expect(component.isOpen()).toBe(true);
    expect(vi.mocked(ngZone.run)).toHaveBeenCalled();
  });

  it('abre el chat desde el parámetro móvil de ayuda y limpia la URL', () => {
    window.history.replaceState(null, '', '/mis-reportes?chat=ayuda');
    const component = createComponent();

    component.ngOnInit();

    expect(component.isOpen()).toBe(true);
    expect(window.location.search).not.toContain('chat=ayuda');
    expect(window.location.pathname).toBe('/mis-reportes');
  });

  it('cierra el chat al hacer click fuera del widget', () => {
    const host = document.createElement('section');
    const outside = document.createElement('button');
    document.body.append(host, outside);
    const component = createComponent(host);

    component.toggleChat();
    outside.click();

    expect(component.isOpen()).toBe(false);
    host.remove();
    outside.remove();
  });

  it('mantiene el chat abierto al navegar desde un enlace externo', () => {
    const host = document.createElement('section');
    const outsideLink = document.createElement('a');
    outsideLink.href = '/reportar';
    document.body.append(host, outsideLink);
    const component = createComponent(host);

    component.toggleChat();
    outsideLink.click();

    expect(component.isOpen()).toBe(true);
    host.remove();
    outsideLink.remove();
  });

  it('mantiene el chat abierto al navegar desde una acción del asistente', () => {
    const component = createComponent();

    component.toggleChat();
    component.abrirAccion({ etiqueta: 'Ir a reportar', ruta: '/reportar' });

    expect(component.isOpen()).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/reportar');
  });

  it('mantiene el chat abierto al hacer click dentro del widget', () => {
    const host = document.createElement('section');
    const inside = document.createElement('button');
    host.appendChild(inside);
    document.body.appendChild(host);
    const component = createComponent(host);

    component.toggleChat();
    inside.click();

    expect(component.isOpen()).toBe(true);
    host.remove();
  });
});
