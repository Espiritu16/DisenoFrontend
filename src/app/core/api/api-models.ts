export interface ApiResponse<T> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
  path: string;
}

export type ApiRole = 'CIUDADANO' | 'ADMIN' | 'OPERADOR' | 'AUTORIDAD';
export type ApiUserStatus = 'ACTIVO' | 'INACTIVO';
export type ApiReportStatus = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'DUPLICADO' | 'RECHAZADO' | 'ESCALADO';
export type ApiCaseStatus = 'EN_PROCESO' | 'RESUELTO' | 'ESCALADO' | 'RECHAZADO';
export type ApiCasePriority = 'BAJA' | 'MEDIA' | 'ALTA';

export interface AuthSessionResponse {
  token: string;
  refreshToken: string;
  userId: number;
  nombre?: string;
  correo: string;
  rol: ApiRole;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  correo: string;
  rol: ApiRole;
  estado: ApiUserStatus;
}

export interface ReporteResponse {
  id: number;
  usuarioId: number;
  tipo: string;
  descripcion: string;
  fotoUrl: string;
  fotoUrls: string[];
  lat: number;
  lng: number;
  direccion: string;
  zona: string;
  posibleDuplicado: boolean;
  estado: ApiReportStatus;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ReporteRequest {
  tipo: string;
  descripcion: string;
  fotoUrl: string;
  fotoUrls?: string[];
  lat: number;
  lng: number;
  direccion: string;
  zona: string;
}

export interface CasoResponse {
  id: number;
  reporteId: number;
  responsableId: number;
  prioridad: ApiCasePriority;
  estado: ApiCaseStatus;
  observaciones?: string;
  evidenciaCierre?: string;
  evidenciaCierreUrls: string[];
  fechaAsignacion: string;
  fechaCierre?: string;
}

export interface HistorialCambio {
  tipo: string;
  estadoAnterior?: string;
  estadoNuevo: string;
  observacion?: string;
  cambiadoPor: number;
  fechaCambio: string;
}

export interface DetalleTrazabilidadReporte {
  reporteId: number;
  casoId?: number;
  historialReporte: HistorialCambio[];
  historialCaso: HistorialCambio[];
}

export interface TableroKpi {
  totalReportes: number;
  reportesPendientes: number;
  reportesEnProceso: number;
  reportesResueltos: number;
  totalCiudadanosReportantes: number;
  casosAbiertos: number;
  casosResueltos: number;
  promedioHorasResolucion: number;
  incrementoEstimadoPorcentaje: number;
  recomendacionAutomatica: string;
  actividadSemanal: ActividadSemanalItem[];
  reportesPorMes: ReportePorMesItem[];
  usuariosReportantesPorMes: UsuarioReportantePorMesItem[];
  reportesPorCategoria: ReportePorCategoriaItem[];
  reportesPorEstado: ReportePorEstadoItem[];
  reportesPorZona: ReportePorZonaItem[];
  tiemposPorZona: TiempoAtencionPorZonaItem[];
  zonasCriticas: TendenciaZonaItem[];
  proyeccionMensual: ProyeccionMensualItem[];
  categoriasConCrecimiento: CategoriaCrecimientoItem[];
  zonasRiesgo: ZonaRiesgoItem[];
  nivelesAgua: NivelAguaResponse[];
}

export interface ActividadSemanalItem {
  dia: string;
  valor: number;
}

export interface ReportePorZonaItem {
  nombre: string;
  cantidad: number;
}

export interface ReportePorMesItem {
  mes: string;
  cantidad: number;
}

export interface UsuarioReportantePorMesItem {
  mes: string;
  cantidad: number;
}

export interface ReportePorCategoriaItem {
  categoria: string;
  cantidad: number;
}

export interface ReportePorEstadoItem {
  estado: string;
  cantidad: number;
}

export interface ProyeccionMensualItem {
  mes: string;
  estimado: number;
}

export interface CategoriaCrecimientoItem {
  categoria: string;
  baseActual: number;
  estimadoSiguienteMes: number;
  crecimientoPorcentual: number;
}

export interface ZonaRiesgoItem {
  zona: string;
  reportes: number;
  nivelRiesgo: string;
}

export type ApiAlertStatus = 'PROGRAMADA' | 'ACTIVA' | 'RESUELTA' | 'CANCELADA';
export type ApiAlertSeverity = 'INFO' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type ApiServiceAlertType =
  | 'CORTE_PROGRAMADO'
  | 'CORTE_NO_PROGRAMADO'
  | 'MANTENIMIENTO'
  | 'RIESGO_DESABASTECIMIENTO'
  | 'INFORMATIVA';

export interface AlertaServicioResponse {
  id: number;
  zona?: string;
  tipo: ApiServiceAlertType;
  titulo: string;
  descripcion: string;
  severidad: ApiAlertSeverity;
  estado: ApiAlertStatus;
  iniciaEn?: string;
  finalizaEn?: string;
  creadoEn: string;
}

export interface ZonaServicioResponse {
  id: number;
  nombre: string;
  codigo: string;
}

export interface AlertaServicioRequest {
  zonaId?: number;
  tipo: ApiServiceAlertType;
  titulo: string;
  descripcion: string;
  severidad?: ApiAlertSeverity;
  estado?: ApiAlertStatus;
  iniciaEn?: string;
  finalizaEn?: string;
}

export interface TiempoAtencionPorZonaItem {
  zona: string;
  promedioHoras: number;
  casosResueltos: number;
}

export interface TendenciaZonaItem {
  zona: string;
  reportesUltimos30Dias: number;
  reportes30DiasPrevios: number;
  variacionPorcentual: number;
}

export interface NivelAguaResponse {
  infraestructuraId: number;
  nombre: string;
  zona: string;
  tipo: 'TANQUE' | 'RESERVORIO' | 'TUBERIA_PRINCIPAL';
  nivelPorcentaje?: number;
  bateriaPorcentaje?: number;
  senalPorcentaje?: number;
  estado: 'NORMAL' | 'BAJO' | 'CRITICO' | 'SIN_DATOS';
  actualizadoEn?: string;
}

export interface ArchivoSubidoResponse {
  url: string;
  nombreArchivo: string;
  publicId?: string;
  archivos?: ArchivoSubidoItem[];
}

export interface ArchivoSubidoItem {
  url: string;
  nombreArchivo: string;
  publicId?: string;
}

export interface ChatbotMessageRequest {
  rol: 'user' | 'assistant';
  contenido: string;
}

export interface ChatbotRequest {
  mensaje: string;
  historial: ChatbotMessageRequest[];
  fechaConversacion?: string;
}

export interface ChatbotResponse {
  respuesta: string;
  proveedor: string;
  modelo: string;
  iaDisponible: boolean;
  conversacionId?: number;
  fechaConversacion?: string;
  persistido: boolean;
  acciones: ChatbotAction[];
}

export interface ChatbotAction {
  etiqueta: string;
  ruta: string;
}

export interface ChatbotConversationSummary {
  id: number;
  fechaConversacion: string;
  titulo: string;
  totalMensajes: number;
  actualizadoEn: string;
}

export interface ChatbotHistoryMessage {
  id: number;
  rol: 'user' | 'assistant';
  contenido: string;
  proveedor?: string;
  modelo?: string;
  iaDisponible: boolean;
  creadoEn: string;
}

export interface ChatbotDayHistory {
  conversacionId?: number;
  fechaConversacion: string;
  mensajes: ChatbotHistoryMessage[];
}
