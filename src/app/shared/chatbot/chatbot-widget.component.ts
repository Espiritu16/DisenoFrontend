import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../../core/api/chatbot.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { AquaLogoComponent } from '../public/aqua-logo/aqua-logo.component';
import { AuthService } from '../../core/api/auth.service';
import { ChatbotAction, ChatbotConversationSummary } from '../../core/api/api-models';

interface ChatMessage {
  readonly author: 'assistant' | 'user';
  readonly text: string;
  readonly actions?: ChatbotAction[];
  readonly isWelcome?: boolean;
}

interface GuestChatStorage {
  readonly conversaciones: Record<string, ChatMessage[]>;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, AquaLogoComponent],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css'
})
export class ChatbotWidgetComponent {
  private readonly guestStorageKey = 'aquacomunidad.chatbot.invitado.v1';
  private readonly maxGuestDays = 30;
  private readonly maxGuestMessagesPerDay = 80;
  private readonly puedeUsarDocumento = typeof document !== 'undefined';
  private removerCapturaScroll?: () => void;

  @ViewChild('messageScroller') private messageScroller?: ElementRef<HTMLElement>;

  readonly isOpen = signal(false);
  readonly isSending = signal(false);
  readonly estaCargandoHistorial = signal(false);
  readonly error = signal<string | null>(null);
  readonly conversaciones = signal<ChatbotConversationSummary[]>([]);
  readonly fechaSeleccionada = signal(this.fechaHoy());
  readonly conversacionesVisibles = computed(() => {
    const conversaciones = this.conversaciones();
    const fecha = this.fechaSeleccionada();
    if (conversaciones.some((conversacion) => conversacion.fechaConversacion === fecha)) {
      return conversaciones;
    }
    const mensajesGuardables = this.messages().filter((mensaje) => !mensaje.isWelcome).length;
    return [{
      id: 0,
      fechaConversacion: fecha,
      titulo: fecha === this.fechaHoy() ? 'Chat de hoy' : `Chat del ${fecha}`,
      totalMensajes: mensajesGuardables,
      actualizadoEn: ''
    }, ...conversaciones];
  });
  readonly messages = signal<ChatMessage[]>([
    this.mensajeBienvenida()
  ]);

  draft = '';

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.desactivarCapturaScroll();
  }

  toggleChat(): void {
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.desactivarCapturaScroll();
      return;
    }
    this.activarCapturaScroll();
    this.cargarHistorialInicial();
  }

  closeChat(): void {
    this.isOpen.set(false);
    this.desactivarCapturaScroll();
  }

  sendMessage(): void {
    const text = this.draft.trim();
    if (!text || this.isSending()) {
      return;
    }

    const userMessage: ChatMessage = { author: 'user', text };
    const history = this.messages();
    this.messages.update((messages) => [...messages, userMessage]);
    this.guardarHistorialInvitado();
    this.draft = '';
    this.error.set(null);
    this.isSending.set(true);

    this.chatbotService.enviarMensaje({
      mensaje: text,
      historial: history.slice(-8).filter((message) => !message.isWelcome).map((message) => ({
        rol: message.author,
        contenido: message.text
      })),
      fechaConversacion: this.fechaSeleccionada()
    }).subscribe({
      next: (response) => {
        const accionesPorIntencion = this.accionesDesdeTexto(text);
        const actions = accionesPorIntencion.length
          ? accionesPorIntencion
          : response.acciones?.length
            ? response.acciones
            : this.accionesDesdeTexto(response.respuesta);
        this.messages.update((messages) => [
          ...messages,
          { author: 'assistant', text: response.respuesta, actions }
        ]);
        this.guardarHistorialInvitado();
        this.isSending.set(false);
        if (response.persistido) {
          this.recargarConversaciones();
        }
      },
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.guardarHistorialInvitado();
        this.isSending.set(false);
      }
    });
  }

  seleccionarFecha(fecha: string): void {
    if (fecha === this.fechaSeleccionada() || this.estaCargandoHistorial()) {
      return;
    }
    this.fechaSeleccionada.set(fecha);
    this.cargarMensajesDelDia(fecha);
  }

  etiquetaFecha(fecha: string): string {
    const hoy = this.fechaHoy();
    if (fecha === hoy) {
      return 'Hoy';
    }
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    if (fecha === this.formatearFecha(ayer)) {
      return 'Ayer';
    }
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  tieneSesion(): boolean {
    return Boolean(this.authService.token);
  }

  abrirAccion(accion: ChatbotAction): void {
    if (!accion.ruta) {
      return;
    }
    this.closeChat();
    void this.router.navigateByUrl(accion.ruta);
  }

  private cargarHistorialInicial(): void {
    if (!this.authService.token) {
      this.cargarHistorialInvitado();
      return;
    }
    this.recargarConversaciones();
    this.cargarMensajesDelDia(this.fechaSeleccionada());
  }

  private recargarConversaciones(): void {
    if (!this.authService.token) {
      return;
    }
    this.chatbotService.listarConversaciones().subscribe({
      next: (conversaciones) => this.conversaciones.set(conversaciones),
      error: () => undefined
    });
  }

  private cargarMensajesDelDia(fecha: string): void {
    if (!this.authService.token) {
      this.cargarMensajesInvitadosDelDia(fecha);
      return;
    }
    this.estaCargandoHistorial.set(true);
    this.error.set(null);
    this.chatbotService.obtenerHistorial(fecha).subscribe({
      next: (historial) => {
        const mensajes = historial.mensajes.map((mensaje) => ({
          author: mensaje.rol,
          text: mensaje.contenido,
          actions: mensaje.rol === 'assistant' ? this.accionesDesdeTexto(mensaje.contenido) : []
        } satisfies ChatMessage));
        this.messages.set(mensajes.length ? mensajes : [this.mensajeBienvenida()]);
        this.estaCargandoHistorial.set(false);
      },
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.estaCargandoHistorial.set(false);
      }
    });
  }

  private mensajeBienvenida(): ChatMessage {
    return {
      author: 'assistant',
      text: 'Hola, soy el asistente de AquaComunidad. Puedo orientarte para reportar una incidencia o consultar el avance de un reporte.',
      actions: [
        { etiqueta: 'Ir a reportar', ruta: '/reportar' },
        { etiqueta: 'Ver Mis Reportes', ruta: '/mis-reportes' }
      ],
      isWelcome: true
    };
  }

  private accionesDesdeTexto(texto: string): ChatbotAction[] {
    const normalizado = texto.toLowerCase();
    if (normalizado.includes('registr') || normalizado.includes('crear cuenta') || normalizado.includes('cuenta')) {
      return [{ etiqueta: 'Registrarse', ruta: '/inicio?auth=registro' }];
    }
    if (normalizado.includes('iniciar sesion') || normalizado.includes('iniciar sesión') || normalizado.includes('acceder') || normalizado.includes('login')) {
      return [{ etiqueta: 'Acceder', ruta: '/inicio?auth=login' }];
    }
    if (normalizado.includes('mis reportes') || normalizado.includes('seguimiento') || normalizado.includes('trazabilidad')) {
      return [{ etiqueta: 'Ver Mis Reportes', ruta: '/mis-reportes' }];
    }
    if (normalizado.includes('reportar') || normalizado.includes('incidencia') || normalizado.includes('fuga')) {
      return [{ etiqueta: 'Ir a reportar', ruta: '/reportar' }];
    }
    if (normalizado.includes('contacto') || normalizado.includes('soporte') || normalizado.includes('emergencia')) {
      return [{ etiqueta: 'Ir a Contacto', ruta: '/contacto' }];
    }
    return [];
  }

  private fechaHoy(): string {
    return this.formatearFecha(new Date());
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private cargarHistorialInvitado(): void {
    const historial = this.leerHistorialInvitado();
    this.conversaciones.set(this.resumirHistorialInvitado(historial));
    this.cargarMensajesInvitadosDelDia(this.fechaSeleccionada());
  }

  private cargarMensajesInvitadosDelDia(fecha: string): void {
    const historial = this.leerHistorialInvitado();
    const mensajes = historial.conversaciones[fecha] ?? [];
    this.messages.set(mensajes.length ? mensajes : [this.mensajeBienvenidaInvitado()]);
  }

  private guardarHistorialInvitado(): void {
    if (this.authService.token) {
      return;
    }

    const fecha = this.fechaSeleccionada();
    const historial = this.leerHistorialInvitado();
    const mensajes = this.messages()
      .filter((mensaje) => !mensaje.isWelcome)
      .slice(-this.maxGuestMessagesPerDay)
      .map((mensaje) => ({
        author: mensaje.author,
        text: mensaje.text,
        actions: mensaje.actions
      } satisfies ChatMessage));

    if (mensajes.length) {
      historial.conversaciones[fecha] = mensajes;
    } else {
      delete historial.conversaciones[fecha];
    }

    this.podarHistorialInvitado(historial);
    this.escribirHistorialInvitado(historial);
    this.conversaciones.set(this.resumirHistorialInvitado(historial));
  }

  private leerHistorialInvitado(): GuestChatStorage {
    try {
      const raw = localStorage.getItem(this.guestStorageKey);
      if (!raw) {
        return { conversaciones: {} };
      }
      const parsed = JSON.parse(raw) as Partial<GuestChatStorage>;
      return {
        conversaciones: parsed.conversaciones && typeof parsed.conversaciones === 'object'
          ? parsed.conversaciones
          : {}
      };
    } catch {
      localStorage.removeItem(this.guestStorageKey);
      return { conversaciones: {} };
    }
  }

  private escribirHistorialInvitado(historial: GuestChatStorage): void {
    try {
      localStorage.setItem(this.guestStorageKey, JSON.stringify(historial));
    } catch {
      this.error.set('No se pudo conservar el historial en este navegador.');
    }
  }

  private resumirHistorialInvitado(historial: GuestChatStorage): ChatbotConversationSummary[] {
    return Object.entries(historial.conversaciones)
      .filter(([, mensajes]) => mensajes.length > 0)
      .sort(([fechaA], [fechaB]) => fechaB.localeCompare(fechaA))
      .map(([fecha, mensajes], index) => ({
        id: -(index + 1),
        fechaConversacion: fecha,
        titulo: fecha === this.fechaHoy() ? 'Chat de hoy' : `Chat del ${fecha}`,
        totalMensajes: mensajes.length,
        actualizadoEn: ''
      }));
  }

  private podarHistorialInvitado(historial: GuestChatStorage): void {
    const fechasOrdenadas = Object.keys(historial.conversaciones).sort((a, b) => b.localeCompare(a));
    for (const fecha of fechasOrdenadas.slice(this.maxGuestDays)) {
      delete historial.conversaciones[fecha];
    }
  }

  private mensajeBienvenidaInvitado(): ChatMessage {
    return {
      ...this.mensajeBienvenida(),
      text: 'Hola, soy el asistente de AquaComunidad. Tu chat se conservará en este navegador; inicia sesión para guardarlo en tu cuenta.'
    };
  }

  private activarCapturaScroll(): void {
    if (!this.puedeUsarDocumento || this.removerCapturaScroll) {
      return;
    }

    const redirigirScroll = (event: WheelEvent) => this.redirigirScrollAlChat(event);
    document.addEventListener('wheel', redirigirScroll, { passive: false, capture: true });
    this.removerCapturaScroll = () => {
      document.removeEventListener('wheel', redirigirScroll, { capture: true });
    };
  }

  private desactivarCapturaScroll(): void {
    this.removerCapturaScroll?.();
    this.removerCapturaScroll = undefined;
  }

  private redirigirScrollAlChat(event: WheelEvent): void {
    if (!this.isOpen() || event.ctrlKey) {
      return;
    }

    const scroller = this.messageScroller?.nativeElement;
    if (!scroller) {
      return;
    }

    event.preventDefault();
    scroller.scrollTop += this.normalizarDeltaScroll(event, scroller);
  }

  private normalizarDeltaScroll(event: WheelEvent, scroller: HTMLElement): number {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return event.deltaY * 16;
    }
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return event.deltaY * scroller.clientHeight;
    }
    return event.deltaY;
  }
}
