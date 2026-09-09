/**
 * Almacén en memoria que sustituye al backend en la demo pública.
 *
 * Mantiene el contrato de la API real (`core/api/api-models.ts`) para que ni los
 * servicios ni los componentes noten la diferencia. El estado vive en memoria:
 * al recargar la página la demo vuelve a su punto de partida.
 */
import {
  ActividadSemanalItem,
  AlertaServicioRequest,
  AlertaServicioResponse,
  ApiCasePriority,
  ApiCaseStatus,
  ApiRole,
  ApiUserStatus,
  AuthSessionResponse,
  CasoResponse,
  CategoriaCrecimientoItem,
  ChatbotConversationSummary,
  ChatbotDayHistory,
  ChatbotHistoryMessage,
  ChatbotRequest,
  ChatbotResponse,
  DetalleTrazabilidadReporte,
  HistorialCambio,
  ReporteRequest,
  ReporteResponse,
  TableroKpi,
  UsuarioResponse,
  ZonaServicioResponse,
} from '../app/core/api/api-models';
import { CUENTAS_DEMO } from './demo.config';
import {
  ALERTAS_SEMILLA,
  CASOS_SEMILLA,
  ID_CIUDADANO_DEMO,
  NIVELES_AGUA_SEMILLA,
  REPORTES_SEMILLA,
  RESPUESTAS_CHATBOT,
  USUARIOS_SEMILLA,
  ZONAS_SEMILLA,
} from './datos-semilla';

export class ErrorDemo extends Error {
  constructor(
    readonly status: number,
    mensaje: string
  ) {
    super(mensaje);
    this.name = 'ErrorDemo';
  }
}

export interface FiltroReportes {
  usuarioId?: number | string;
  estado?: string;
  tipo?: string;
  zona?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

function normalizar(texto: string | null | undefined): string {
  return (texto ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function ahora(): string {
  return new Date().toISOString();
}

function horasEntre(desde: string, hasta: string): number {
  return (new Date(hasta).getTime() - new Date(desde).getTime()) / 36e5;
}

// El tablero filtra los meses por estas abreviaturas exactas ('Sep', no 'Set'),
// así que deben coincidir con las que espera dashboard.component.ts.
const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export class AlmacenDemo {
  private usuarios: UsuarioResponse[] = [];
  private reportes: ReporteResponse[] = [];
  private casos: CasoResponse[] = [];
  private alertas: AlertaServicioResponse[] = [];
  private zonas: ZonaServicioResponse[] = [];
  private historialReportes = new Map<number, HistorialCambio[]>();
  private historialCasos = new Map<number, HistorialCambio[]>();
  private conversaciones: { id: number; fecha: string; mensajes: ChatbotHistoryMessage[] }[] = [];
  private secuencia = 1000;
  /** Usuario con la sesión abierta; determina qué ve «mis reportes». */
  private sesionUsuarioId = ID_CIUDADANO_DEMO;

  constructor() {
    this.reiniciar();
  }

  reiniciar(): void {
    this.usuarios = clonar(USUARIOS_SEMILLA);
    this.reportes = clonar(REPORTES_SEMILLA);
    this.casos = clonar(CASOS_SEMILLA);
    this.alertas = clonar(ALERTAS_SEMILLA);
    this.zonas = clonar(ZONAS_SEMILLA);
    this.conversaciones = [];
    this.secuencia = 1000;
    this.sesionUsuarioId = ID_CIUDADANO_DEMO;
    this.historialReportes.clear();
    this.historialCasos.clear();
    this.reconstruirHistorial();
  }

  /** Deja una traza inicial coherente con el estado de cada reporte y caso. */
  private reconstruirHistorial(): void {
    this.reportes.forEach((reporte) => {
      const historial: HistorialCambio[] = [
        {
          tipo: 'REPORTE',
          estadoNuevo: 'PENDIENTE',
          observacion: 'Reporte registrado por el vecino.',
          cambiadoPor: reporte.usuarioId,
          fechaCambio: reporte.fechaCreacion,
        },
      ];
      if (reporte.estado !== 'PENDIENTE') {
        historial.push({
          tipo: 'REPORTE',
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: reporte.estado,
          observacion: 'Actualización durante la atención.',
          cambiadoPor: 1,
          fechaCambio: reporte.fechaActualizacion,
        });
      }
      this.historialReportes.set(reporte.id, historial);
    });

    this.casos.forEach((caso) => {
      const historial: HistorialCambio[] = [
        {
          tipo: 'CASO',
          estadoNuevo: 'EN_PROCESO',
          observacion: 'Caso asignado a un responsable.',
          cambiadoPor: 1,
          fechaCambio: caso.fechaAsignacion,
        },
      ];
      if (caso.estado !== 'EN_PROCESO' && caso.fechaCierre) {
        historial.push({
          tipo: 'CASO',
          estadoAnterior: 'EN_PROCESO',
          estadoNuevo: caso.estado,
          observacion: caso.observaciones,
          cambiadoPor: caso.responsableId,
          fechaCambio: caso.fechaCierre,
        });
      }
      this.historialCasos.set(caso.id, historial);
    });
  }

  private nuevoId(): number {
    this.secuencia += 1;
    return this.secuencia;
  }

  // ---------------------------------------------------------------- Autenticación

  login(correo: string, password: string): AuthSessionResponse {
    const email = (correo ?? '').trim().toLowerCase();
    const cuenta = CUENTAS_DEMO.find((c) => c.correo === email && c.password === password);
    if (!cuenta) {
      throw new ErrorDemo(401, 'Credenciales inválidas. Usa uno de los accesos de demostración.');
    }
    const usuario = this.usuarios.find((u) => u.correo === cuenta.correo);
    this.sesionUsuarioId = usuario?.id ?? ID_CIUDADANO_DEMO;

    return {
      token: `demo-token-${cuenta.rol.toLowerCase()}`,
      refreshToken: `demo-refresh-${cuenta.rol.toLowerCase()}`,
      userId: this.sesionUsuarioId,
      nombre: cuenta.nombre,
      correo: cuenta.correo,
      rol: cuenta.rol,
    };
  }

  registrar(nombre: string, correo: string, rol: ApiRole = 'CIUDADANO'): AuthSessionResponse {
    const email = (correo ?? '').trim().toLowerCase();
    if (this.usuarios.some((u) => normalizar(u.correo) === normalizar(email))) {
      throw new ErrorDemo(409, 'Ya existe una cuenta con ese correo.');
    }
    const usuario: UsuarioResponse = { id: this.nuevoId(), nombre, correo: email, rol, estado: 'ACTIVO' };
    this.usuarios.unshift(usuario);
    this.sesionUsuarioId = usuario.id;

    return {
      token: 'demo-token-ciudadano',
      refreshToken: 'demo-refresh-ciudadano',
      userId: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };
  }

  get usuarioSesion(): number {
    return this.sesionUsuarioId;
  }

  // ---------------------------------------------------------------- Usuarios

  listarUsuarios(): UsuarioResponse[] {
    return this.usuarios;
  }

  crearUsuario(nombre: string, correo: string, rol: ApiRole): UsuarioResponse {
    if (this.usuarios.some((u) => normalizar(u.correo) === normalizar(correo))) {
      throw new ErrorDemo(409, 'Ya existe un usuario con ese correo.');
    }
    const usuario: UsuarioResponse = { id: this.nuevoId(), nombre, correo, rol, estado: 'ACTIVO' };
    this.usuarios.unshift(usuario);
    return usuario;
  }

  actualizarRolEstado(id: number, rol: ApiRole, estado: ApiUserStatus): UsuarioResponse {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) throw new ErrorDemo(404, 'Usuario no encontrado en la demo.');
    usuario.rol = rol;
    usuario.estado = estado;
    return usuario;
  }

  // ---------------------------------------------------------------- Reportes

  listarReportes(filtro: FiltroReportes = {}): ReporteResponse[] {
    const desde = filtro.fechaDesde ? new Date(filtro.fechaDesde) : null;
    const hasta = filtro.fechaHasta ? new Date(filtro.fechaHasta) : null;

    return this.reportes
      .filter((r) => {
        if (filtro.usuarioId != null && r.usuarioId !== Number(filtro.usuarioId)) return false;
        if (filtro.estado && r.estado !== filtro.estado) return false;
        if (filtro.tipo && normalizar(r.tipo) !== normalizar(filtro.tipo)) return false;
        if (filtro.zona && normalizar(r.zona) !== normalizar(filtro.zona)) return false;
        const fecha = new Date(r.fechaCreacion);
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
      })
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }

  listarMisReportes(): ReporteResponse[] {
    return this.listarReportes({ usuarioId: this.sesionUsuarioId });
  }

  crearReporte(payload: ReporteRequest): ReporteResponse {
    if (!payload?.tipo || !payload?.descripcion) {
      throw new ErrorDemo(400, 'El tipo y la descripción son obligatorios.');
    }

    // Se marca como posible duplicado si ya hay un reporte reciente del mismo
    // tipo en la misma zona, igual que hace el backend real.
    const limite = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const duplicado = this.reportes.some(
      (r) =>
        normalizar(r.tipo) === normalizar(payload.tipo) &&
        normalizar(r.zona) === normalizar(payload.zona) &&
        new Date(r.fechaCreacion).getTime() >= limite
    );

    const reporte: ReporteResponse = {
      id: this.nuevoId(),
      usuarioId: this.sesionUsuarioId,
      tipo: payload.tipo,
      descripcion: payload.descripcion,
      fotoUrl: payload.fotoUrl ?? '',
      fotoUrls: payload.fotoUrls ?? [],
      lat: payload.lat,
      lng: payload.lng,
      direccion: payload.direccion,
      zona: payload.zona,
      posibleDuplicado: duplicado,
      estado: 'PENDIENTE',
      fechaCreacion: ahora(),
      fechaActualizacion: ahora(),
    };

    this.reportes.unshift(reporte);
    this.historialReportes.set(reporte.id, [
      {
        tipo: 'REPORTE',
        estadoNuevo: 'PENDIENTE',
        observacion: 'Reporte registrado desde la aplicación.',
        cambiadoPor: this.sesionUsuarioId,
        fechaCambio: reporte.fechaCreacion,
      },
    ]);

    return reporte;
  }

  trazabilidad(reporteId: number): DetalleTrazabilidadReporte {
    const reporte = this.reportes.find((r) => r.id === reporteId);
    if (!reporte) throw new ErrorDemo(404, 'Reporte no encontrado en la demo.');
    const caso = this.casos.find((c) => c.reporteId === reporteId);

    return {
      reporteId,
      casoId: caso?.id,
      historialReporte: this.historialReportes.get(reporteId) ?? [],
      historialCaso: caso ? this.historialCasos.get(caso.id) ?? [] : [],
    };
  }

  private cambiarEstadoReporte(
    reporte: ReporteResponse,
    estado: ReporteResponse['estado'],
    observacion: string,
    porUsuario: number
  ): void {
    const anterior = reporte.estado;
    reporte.estado = estado;
    reporte.fechaActualizacion = ahora();
    const historial = this.historialReportes.get(reporte.id) ?? [];
    historial.push({
      tipo: 'REPORTE',
      estadoAnterior: anterior,
      estadoNuevo: estado,
      observacion,
      cambiadoPor: porUsuario,
      fechaCambio: reporte.fechaActualizacion,
    });
    this.historialReportes.set(reporte.id, historial);
  }

  // ---------------------------------------------------------------- Casos

  listarCasos(estado?: string): CasoResponse[] {
    return this.casos
      .filter((c) => !estado || c.estado === estado)
      .sort((a, b) => new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime());
  }

  crearCaso(reporteId: number, responsableId: number, prioridad: ApiCasePriority): CasoResponse {
    const reporte = this.reportes.find((r) => r.id === Number(reporteId));
    if (!reporte) throw new ErrorDemo(404, 'El reporte indicado no existe.');
    if (this.casos.some((c) => c.reporteId === reporte.id)) {
      throw new ErrorDemo(409, 'Este reporte ya tiene un caso asignado.');
    }

    const caso: CasoResponse = {
      id: this.nuevoId(),
      reporteId: reporte.id,
      reporteTipo: reporte.tipo,
      reporteZona: reporte.zona,
      reporteDescripcion: reporte.descripcion,
      reporteFechaCreacion: reporte.fechaCreacion,
      responsableId: Number(responsableId),
      prioridad,
      estado: 'EN_PROCESO',
      observaciones: '',
      evidenciaCierreUrls: [],
      fechaAsignacion: ahora(),
    };

    this.casos.unshift(caso);
    this.historialCasos.set(caso.id, [
      {
        tipo: 'CASO',
        estadoNuevo: 'EN_PROCESO',
        observacion: 'Caso asignado a un responsable.',
        cambiadoPor: 1,
        fechaCambio: caso.fechaAsignacion,
      },
    ]);

    // Asignar un caso pone el reporte en atención.
    this.cambiarEstadoReporte(reporte, 'EN_PROCESO', 'Se asignó un caso para su atención.', 1);
    return caso;
  }

  actualizarEstadoCaso(
    id: number,
    estado: ApiCaseStatus,
    observaciones: string,
    evidenciaCierre?: string,
    evidenciaCierreUrls?: string[]
  ): CasoResponse {
    const caso = this.casos.find((c) => c.id === Number(id));
    if (!caso) throw new ErrorDemo(404, 'Caso no encontrado en la demo.');
    if (caso.fechaCierre) throw new ErrorDemo(409, 'Este caso ya fue cerrado.');

    const anterior = caso.estado;
    caso.estado = estado;
    caso.observaciones = observaciones;
    caso.evidenciaCierre = evidenciaCierre;
    caso.evidenciaCierreUrls = evidenciaCierreUrls ?? [];
    if (estado !== 'EN_PROCESO') {
      caso.fechaCierre = ahora();
    }

    const historial = this.historialCasos.get(caso.id) ?? [];
    historial.push({
      tipo: 'CASO',
      estadoAnterior: anterior,
      estadoNuevo: estado,
      observacion: observaciones,
      cambiadoPor: caso.responsableId,
      fechaCambio: ahora(),
    });
    this.historialCasos.set(caso.id, historial);

    // El reporte sigue al caso: resuelto, escalado o rechazado.
    const reporte = this.reportes.find((r) => r.id === caso.reporteId);
    if (reporte) {
      const mapa: Record<ApiCaseStatus, ReporteResponse['estado']> = {
        EN_PROCESO: 'EN_PROCESO',
        RESUELTO: 'RESUELTO',
        ESCALADO: 'ESCALADO',
        RECHAZADO: 'RECHAZADO',
      };
      this.cambiarEstadoReporte(reporte, mapa[estado], observaciones, caso.responsableId);
    }

    return caso;
  }

  // ---------------------------------------------------------------- Estado del servicio

  listarZonas(): ZonaServicioResponse[] {
    return this.zonas;
  }

  listarAlertas(filtro: { zona?: string; estado?: string; tipo?: string } = {}): AlertaServicioResponse[] {
    return this.alertas
      .filter(
        (a) =>
          (!filtro.zona || normalizar(a.zona) === normalizar(filtro.zona)) &&
          (!filtro.estado || a.estado === filtro.estado) &&
          (!filtro.tipo || a.tipo === filtro.tipo)
      )
      .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
  }

  crearAlerta(payload: AlertaServicioRequest): AlertaServicioResponse {
    if (!payload?.titulo?.trim()) throw new ErrorDemo(400, 'El título de la alerta es obligatorio.');
    const zona = this.zonas.find((z) => z.id === Number(payload.zonaId));

    const alerta: AlertaServicioResponse = {
      id: this.nuevoId(),
      zona: zona?.nombre,
      tipo: payload.tipo,
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      severidad: payload.severidad ?? 'INFO',
      estado: payload.estado ?? 'PROGRAMADA',
      iniciaEn: payload.iniciaEn,
      finalizaEn: payload.finalizaEn,
      creadoEn: ahora(),
    };
    this.alertas.unshift(alerta);
    return alerta;
  }

  // ---------------------------------------------------------------- Tablero

  obtenerKpis(): TableroKpi {
    const total = this.reportes.length;
    const porEstado = (estado: string) => this.reportes.filter((r) => r.estado === estado).length;
    const resueltos = this.casos.filter((c) => c.estado === 'RESUELTO' && c.fechaCierre);
    const promedioHoras = resueltos.length
      ? resueltos.reduce((acc, c) => acc + horasEntre(c.fechaAsignacion, c.fechaCierre!), 0) / resueltos.length
      : 0;

    const ahoraFecha = new Date();
    const hace30 = new Date(ahoraFecha.getTime() - 30 * 864e5);
    const hace60 = new Date(ahoraFecha.getTime() - 60 * 864e5);
    const ultimos30 = this.reportes.filter((r) => new Date(r.fechaCreacion) >= hace30).length;
    const previos30 = this.reportes.filter(
      (r) => new Date(r.fechaCreacion) >= hace60 && new Date(r.fechaCreacion) < hace30
    ).length;
    const incremento = previos30 ? ((ultimos30 - previos30) / previos30) * 100 : 0;

    return {
      totalReportes: total,
      reportesPendientes: porEstado('PENDIENTE'),
      reportesEnProceso: porEstado('EN_PROCESO'),
      reportesResueltos: porEstado('RESUELTO'),
      totalCiudadanosReportantes: new Set(this.reportes.map((r) => r.usuarioId)).size,
      casosAbiertos: this.casos.filter((c) => c.estado === 'EN_PROCESO' || c.estado === 'ESCALADO').length,
      casosResueltos: this.casos.filter((c) => c.estado === 'RESUELTO').length,
      promedioHorasResolucion: Math.round(promedioHoras * 10) / 10,
      incrementoEstimadoPorcentaje: Math.round(incremento * 10) / 10,
      recomendacionAutomatica: this.recomendacion(),
      actividadSemanal: this.actividadSemanal(),
      reportesPorMes: this.agruparPorMes(this.reportes.map((r) => r.fechaCreacion)),
      usuariosReportantesPorMes: this.usuariosPorMes(),
      reportesPorCategoria: this.agrupar(this.reportes.map((r) => r.tipo)).map(([categoria, cantidad]) => ({ categoria, cantidad })),
      reportesPorEstado: this.agrupar(this.reportes.map((r) => r.estado)).map(([estado, cantidad]) => ({ estado, cantidad })),
      reportesPorZona: this.agrupar(this.reportes.map((r) => r.zona)).map(([nombre, cantidad]) => ({ nombre, cantidad })),
      tiemposPorZona: this.tiemposPorZona(),
      zonasCriticas: this.zonasCriticas(),
      proyeccionMensual: this.proyeccionMensual(),
      categoriasConCrecimiento: this.categoriasConCrecimiento(),
      zonasRiesgo: this.zonasRiesgo(),
      nivelesAgua: clonar(NIVELES_AGUA_SEMILLA),
    };
  }

  private recomendacion(): string {
    const zonas = this.agrupar(
      this.reportes.filter((r) => r.estado === 'PENDIENTE' || r.estado === 'EN_PROCESO').map((r) => r.zona)
    );
    if (!zonas.length) return 'No hay reportes abiertos: el servicio opera con normalidad.';
    const [zona, cantidad] = zonas[0];
    return `Priorizar cuadrillas en ${zona}: concentra ${cantidad} reporte(s) sin resolver.`;
  }

  private agrupar(valores: string[]): [string, number][] {
    const mapa = new Map<string, number>();
    valores.forEach((v) => mapa.set(v, (mapa.get(v) ?? 0) + 1));
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }

  private actividadSemanal(): ActividadSemanalItem[] {
    const items: ActividadSemanalItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date();
      dia.setDate(dia.getDate() - i);
      const clave = dia.toDateString();
      items.push({
        dia: DIAS_SEMANA[dia.getDay()],
        valor: this.reportes.filter((r) => new Date(r.fechaCreacion).toDateString() === clave).length,
      });
    }
    return items;
  }

  private clavesUltimosMeses(cantidad = 6): { clave: string; etiqueta: string }[] {
    const meses: { clave: string; etiqueta: string }[] = [];
    for (let i = cantidad - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(1);
      fecha.setMonth(fecha.getMonth() - i);
      meses.push({
        clave: `${fecha.getFullYear()}-${fecha.getMonth()}`,
        etiqueta: NOMBRES_MES[fecha.getMonth()],
      });
    }
    return meses;
  }

  private agruparPorMes(fechas: string[]): { mes: string; cantidad: number }[] {
    return this.clavesUltimosMeses().map(({ clave, etiqueta }) => ({
      mes: etiqueta,
      cantidad: fechas.filter((f) => {
        const d = new Date(f);
        return `${d.getFullYear()}-${d.getMonth()}` === clave;
      }).length,
    }));
  }

  private usuariosPorMes(): { mes: string; cantidad: number }[] {
    return this.clavesUltimosMeses().map(({ clave, etiqueta }) => {
      const usuarios = new Set(
        this.reportes
          .filter((r) => {
            const d = new Date(r.fechaCreacion);
            return `${d.getFullYear()}-${d.getMonth()}` === clave;
          })
          .map((r) => r.usuarioId)
      );
      return { mes: etiqueta, cantidad: usuarios.size };
    });
  }

  private tiemposPorZona(): { zona: string; promedioHoras: number; casosResueltos: number }[] {
    return this.zonas
      .map((zona) => {
        const cerrados = this.casos.filter(
          (c) => c.reporteZona === zona.nombre && c.estado === 'RESUELTO' && c.fechaCierre
        );
        const promedio = cerrados.length
          ? cerrados.reduce((acc, c) => acc + horasEntre(c.fechaAsignacion, c.fechaCierre!), 0) / cerrados.length
          : 0;
        return {
          zona: zona.nombre,
          promedioHoras: Math.round(promedio * 10) / 10,
          casosResueltos: cerrados.length,
        };
      })
      .filter((t) => t.casosResueltos > 0);
  }

  private zonasCriticas() {
    const hace30 = new Date(Date.now() - 30 * 864e5);
    const hace60 = new Date(Date.now() - 60 * 864e5);
    return this.zonas
      .map((zona) => {
        const recientes = this.reportes.filter(
          (r) => r.zona === zona.nombre && new Date(r.fechaCreacion) >= hace30
        ).length;
        const previos = this.reportes.filter(
          (r) => r.zona === zona.nombre && new Date(r.fechaCreacion) >= hace60 && new Date(r.fechaCreacion) < hace30
        ).length;
        const variacion = previos ? ((recientes - previos) / previos) * 100 : recientes ? 100 : 0;
        return {
          zona: zona.nombre,
          reportesUltimos30Dias: recientes,
          reportes30DiasPrevios: previos,
          variacionPorcentual: Math.round(variacion * 10) / 10,
        };
      })
      .sort((a, b) => b.reportesUltimos30Dias - a.reportesUltimos30Dias);
  }

  private proyeccionMensual(): { mes: string; estimado: number }[] {
    const historico = this.agruparPorMes(this.reportes.map((r) => r.fechaCreacion));
    const media = historico.reduce((acc, m) => acc + m.cantidad, 0) / (historico.length || 1);
    return this.clavesUltimosMeses(3).map(({ etiqueta }, i) => ({
      mes: etiqueta,
      estimado: Math.max(0, Math.round(media + i)),
    }));
  }

  private categoriasConCrecimiento(): CategoriaCrecimientoItem[] {
    return this.agrupar(this.reportes.map((r) => r.tipo))
      .slice(0, 4)
      .map(([categoria, base]) => {
        const estimado = Math.round(base * 1.15);
        return {
          categoria,
          baseActual: base,
          estimadoSiguienteMes: estimado,
          crecimientoPorcentual: base ? Math.round(((estimado - base) / base) * 1000) / 10 : 0,
        };
      });
  }

  private zonasRiesgo() {
    return this.agrupar(this.reportes.map((r) => r.zona)).map(([zona, reportes]) => ({
      zona,
      reportes,
      nivelRiesgo: reportes >= 5 ? 'ALTO' : reportes >= 3 ? 'MEDIO' : 'BAJO',
    }));
  }

  // ---------------------------------------------------------------- Chatbot

  responderChat(payload: ChatbotRequest): ChatbotResponse {
    const mensaje = normalizar(payload?.mensaje);
    const coincidencia = RESPUESTAS_CHATBOT.find((r) => r.claves.some((clave) => mensaje.includes(normalizar(clave))));

    const respuesta =
      coincidencia?.respuesta ??
      'En esta demostración el asistente responde con textos preparados, sin conectarse a ningún modelo de IA. ' +
        'Puedes preguntar por fugas, cortes de agua, agua turbia, presión baja o el estado de tus reportes.';

    const fecha = payload?.fechaConversacion ?? new Date().toISOString().slice(0, 10);
    this.guardarMensajes(fecha, payload?.mensaje ?? '', respuesta);

    return {
      respuesta,
      proveedor: 'demo',
      modelo: 'respuestas-preparadas',
      iaDisponible: false,
      conversacionId: this.conversaciones.find((c) => c.fecha === fecha)?.id,
      fechaConversacion: fecha,
      persistido: true,
      acciones: coincidencia?.acciones ?? [],
    };
  }

  private guardarMensajes(fecha: string, pregunta: string, respuesta: string): void {
    let conversacion = this.conversaciones.find((c) => c.fecha === fecha);
    if (!conversacion) {
      conversacion = { id: this.nuevoId(), fecha, mensajes: [] };
      this.conversaciones.unshift(conversacion);
    }
    conversacion.mensajes.push(
      { id: this.nuevoId(), rol: 'user', contenido: pregunta, iaDisponible: false, creadoEn: ahora() },
      {
        id: this.nuevoId(),
        rol: 'assistant',
        contenido: respuesta,
        proveedor: 'demo',
        modelo: 'respuestas-preparadas',
        iaDisponible: false,
        creadoEn: ahora(),
      }
    );
  }

  listarConversaciones(): ChatbotConversationSummary[] {
    return this.conversaciones.map((c) => ({
      id: c.id,
      fechaConversacion: c.fecha,
      titulo: c.mensajes[0]?.contenido?.slice(0, 40) || 'Conversación',
      totalMensajes: c.mensajes.length,
      actualizadoEn: c.mensajes[c.mensajes.length - 1]?.creadoEn ?? ahora(),
    }));
  }

  historialConversacion(fecha: string): ChatbotDayHistory {
    const conversacion = this.conversaciones.find((c) => c.fecha === fecha);
    return {
      conversacionId: conversacion?.id,
      fechaConversacion: fecha,
      mensajes: conversacion?.mensajes ?? [],
    };
  }
}

/** Instancia única usada por el interceptor durante toda la sesión de la demo. */
export const almacenDemo = new AlmacenDemo();
