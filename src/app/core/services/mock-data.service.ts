import { Injectable } from '@angular/core';
import { AlertaServicio, Incidencia, IndicadorAutoridad, LecturaIoT, MetricaAtencion, ReportePoblador, ReportStatus } from '../models/app-models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private incidenciasData: Incidencia[] = [
    { id: 'INC-301', zone: 'Sector Alto', tipo: 'Baja presión', description: 'Presión muy baja desde las 6:00', status: 'En proceso', severity: 'Alta', createdAt: '2026-05-10 07:10', responsible: 'Téc. Quispe' },
    { id: 'INC-302', zone: 'Sector Centro', tipo: 'Fuga', description: 'Fuga en válvula principal', status: 'Pendiente', severity: 'Crítica', createdAt: '2026-05-10 08:25' },
    { id: 'INC-303', zone: 'Anexo Norte', tipo: 'Agua turbia', description: 'Coloración marrón en red secundaria', status: 'Resuelto', severity: 'Media', createdAt: '2026-05-09 18:40', responsible: 'Téc. Rojas', evidence: 'Limpieza y purga completada' },
    { id: 'INC-304', zone: 'Zona El Molino', tipo: 'Corte inesperado', description: 'Sin suministro por 2h', status: 'En proceso', severity: 'Alta', createdAt: '2026-05-10 09:15', responsible: 'Téc. Flores' }
  ];
  private reportesData: ReportePoblador[] = [
    { id: 'REP-1001', createdAt: '2026-05-10 08:15', zone: 'Sector Centro', tipo: 'Fuga', detail: 'Fuga en vereda frente a escuela', status: 'En proceso' },
    { id: 'REP-1002', createdAt: '2026-05-09 15:40', zone: 'Anexo Sur', tipo: 'Baja presión', detail: 'No sube agua al segundo piso', status: 'Pendiente' },
    { id: 'REP-1003', createdAt: '2026-05-08 10:20', zone: 'Sector Alto', tipo: 'Agua turbia', detail: 'Olor y color extraño', status: 'Resuelto' }
  ];
  private alertasData: AlertaServicio[] = [
    { id: 'ALT-1', title: 'Mantenimiento programado', description: 'Corte parcial hoy 14:00 - 16:00.', type: 'mantenimiento', zone: 'Sector Centro' },
    { id: 'ALT-2', title: 'Riesgo de desabastecimiento', description: 'Reservorio Norte por debajo del 25%.', type: 'riesgo', zone: 'Anexo Norte' },
    { id: 'ALT-3', title: 'Corte no programado', description: 'Interrupción temporal por reparación de fuga.', type: 'corte', zone: 'Zona El Molino' }
  ];
  private iotData: LecturaIoT[] = [
    { id: 'LIM-01', reservorio: 'Reservorio Rímac Norte', zone: 'San Juan de Lurigancho', levelPct: 22, trend: 'bajando', updatedAt: 'hace 2 min' },
    { id: 'LIM-02', reservorio: 'Reservorio Costa Sur', zone: 'Villa El Salvador', levelPct: 64, trend: 'estable', updatedAt: 'hace 1 min' },
    { id: 'LIM-03', reservorio: 'Tanque Metropolitano', zone: 'Comas', levelPct: 38, trend: 'subiendo', updatedAt: 'hace 3 min' },
    { id: 'LIM-04', reservorio: 'Reservorio Este', zone: 'Ate', levelPct: 47, trend: 'estable', updatedAt: 'hace 4 min' }
  ];
  private metricasData: MetricaAtencion[] = [
    { zone: 'Sector Alto', total: 18, promedioHorasResolucion: 5.1 },
    { zone: 'Sector Centro', total: 26, promedioHorasResolucion: 4.3 },
    { zone: 'Anexo Norte', total: 14, promedioHorasResolucion: 6.2 },
    { zone: 'Zona El Molino', total: 11, promedioHorasResolucion: 3.8 }
  ];
  private indicadoresData: IndicadorAutoridad[] = [
    { label: 'Incidencias del mes', value: '69', note: '+12% vs mes anterior' },
    { label: 'Tiempo promedio', value: '4.9 h', note: '-0.6 h mejora' },
    { label: 'Casos resueltos', value: '81%', note: 'Meta: 85%' },
    { label: 'Zonas críticas', value: '3', note: 'Anexo Norte, Sector Alto, Molino' }
  ];
  getIncidencias(): Incidencia[] { return structuredClone(this.incidenciasData); }
  updateIncidenciaStatus(id: string, status: ReportStatus): Incidencia[] { this.incidenciasData = this.incidenciasData.map((i: Incidencia) => (i.id === id ? { ...i, status } : i)); return this.getIncidencias(); }
  assignIncidencia(id: string, responsible: string): Incidencia[] { this.incidenciasData = this.incidenciasData.map((i: Incidencia) => (i.id === id ? { ...i, responsible } : i)); return this.getIncidencias(); }
  addEvidence(id: string, evidence: string): Incidencia[] { this.incidenciasData = this.incidenciasData.map((i: Incidencia) => (i.id === id ? { ...i, evidence } : i)); return this.getIncidencias(); }
  getReportes(): ReportePoblador[] { return structuredClone(this.reportesData); }
  addReporte(zone: string, tipo: string, detail: string): ReportePoblador {
    const next: ReportePoblador = { id: `REP-${1000 + this.reportesData.length + 1}`, createdAt: '2026-05-11 09:00', zone, tipo, detail, status: 'Pendiente' };
    this.reportesData = [next, ...this.reportesData];
    this.incidenciasData = [{ id: `INC-${400 + this.incidenciasData.length + 1}`, zone, tipo, description: detail, status: 'Pendiente', severity: 'Media', createdAt: next.createdAt }, ...this.incidenciasData];
    return next;
  }
  getAlertas(): AlertaServicio[] { return structuredClone(this.alertasData); }
  getLecturasIot(): LecturaIoT[] { return structuredClone(this.iotData); }
  getMetricas(): MetricaAtencion[] { return structuredClone(this.metricasData); }
  getIndicadores(): IndicadorAutoridad[] { return structuredClone(this.indicadoresData); }
}
