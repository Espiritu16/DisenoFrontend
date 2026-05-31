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

  function createComponent() {
    const component = new ChatbotWidgetComponent(chatbotService, authService, router);
    componentesCreados.push(component);
    return component;
  }

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    vi.clearAllMocks();
  });

  afterEach(() => {
    componentesCreados.splice(0).forEach((component) => component.ngOnDestroy());
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
    primerWidget.toggleChat();
    primerWidget.draft = 'quiero registrarme';
    primerWidget.sendMessage();

    const segundoWidget = createComponent();
    segundoWidget.toggleChat();

    expect(segundoWidget.messages()).toEqual(expect.arrayContaining([
      expect.objectContaining({ author: 'user', text: 'quiero registrarme' }),
      expect.objectContaining({ author: 'assistant', text: 'Para registrarte presiona Registrarse en la cabecera.' })
    ]));
    expect(segundoWidget.conversacionesVisibles()[0].totalMensajes).toBe(2);
  });

  it('redirige el scroll de la ventana al cuerpo del chat cuando está abierto', () => {
    const component = createComponent();
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
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(scroller.scrollTop).toBe(120);
  });
});
