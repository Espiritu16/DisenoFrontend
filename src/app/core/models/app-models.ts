export type UserRole = 'POBLADOR' | 'ADMIN';
export type ReportStatus = 'Pendiente' | 'En proceso' | 'Resuelto';
export type Severity = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export interface AuthSession { userName: string; role: UserRole; }
export interface AlertaServicio { id: string; title: string; description: string; type: 'mantenimiento' | 'corte' | 'riesgo'; zone: string; }
export interface Incidencia { id: string; zone: string; tipo: string; description: string; status: ReportStatus; severity: Severity; createdAt: string; responsible?: string; evidence?: string; }
export interface ReportePoblador { id: string; createdAt: string; zone: string; tipo: string; detail: string; status: ReportStatus; }
export interface LecturaIoT { id: string; reservorio: string; zone: string; levelPct: number; trend: 'subiendo' | 'estable' | 'bajando'; updatedAt: string; }
export interface MetricaAtencion { zone: string; total: number; promedioHorasResolucion: number; }
export interface IndicadorAutoridad { label: string; value: string; note: string; }
