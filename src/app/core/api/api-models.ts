export interface ApiResponse<T> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
  path: string;
}

export type ApiRole = 'CIUDADANO' | 'ADMIN' | 'OPERADOR';
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
  reportesPendientes: number;
  reportesEnProceso: number;
  reportesResueltos: number;
  casosAbiertos: number;
  actividadSemanal: ActividadSemanalItem[];
  reportesPorZona: ReportePorZonaItem[];
}

export interface ActividadSemanalItem {
  dia: string;
  valor: number;
}

export interface ReportePorZonaItem {
  nombre: string;
  cantidad: number;
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
