import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiCasePriority, ApiReportStatus, ReporteResponse, UsuarioResponse } from '../../../core/api/api-models';
import { reportStatusLabel, formatDateTime, reportStatusClass } from '../../../core/api/api-mappers';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ReportesService } from '../../../core/api/reportes.service';
import { CasosService } from '../../../core/api/casos.service';
import { UsuariosService } from '../../../core/api/usuarios.service';

interface ReporteVista {
  id: number;
  usuarioId: number;
  fecha: string;
  /** Versión corta para la tabla, donde la fecha completa no cabe. */
  fechaCorta: string;
  fechaCreacion: string;
  ciudadano: string;
  zona: string;
  tipo: string;
  estado: ApiReportStatus;
  estadoLabel: string;
  descripcion: string;
  ubicacion: string;
  reportadoPor: string;
  evidencia?: string;
  evidenciaUrls: string[];
}

@Component({
  selector: 'app-reportes-ciudadanos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-ciudadanos.component.html',
  styleUrl: './reportes-ciudadanos.component.css'
})
export class ReportesCiudadanosComponent implements OnInit {
  reportes: ReporteVista[] = [];
  selectedReporte: ReporteVista | null = null;
  operadores: UsuarioResponse[] = [];
  private nombresUsuarios = new Map<number, string>();

  loading = false;
  empty = false;
  error = '';
  success = '';
  submitting = false;
  mostrarDerivar = false;

  statusFilter: '' | ApiReportStatus = '';
  tipoFilter = '';
  zonaFilter = '';
  mesFilter = '';
  fechaDesde = '';
  fechaHasta = '';

  responsableId: number | null = null;
  prioridad: ApiCasePriority = 'MEDIA';

  constructor(
    private reportesService: ReportesService,
    private casosService: CasosService,
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOperadores();
    this.loadReportes();
  }

  loadOperadores() {
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.operadores = usuarios.filter((u) => u.rol === 'OPERADOR' && u.estado === 'ACTIVO');
        this.nombresUsuarios = new Map(usuarios.map((u) => [u.id, u.nombre]));
        // Los reportes pueden haberse cargado antes que los usuarios: se
        // reescriben para mostrar el nombre en lugar del identificador.
        this.reportes = this.reportes.map((vista) => ({
          ...vista,
          ciudadano: this.nombreUsuario(vista.usuarioId),
          reportadoPor: this.nombreUsuario(vista.usuarioId)
        }));
        if (this.selectedReporte) {
          this.selectedReporte = this.reportes.find((r) => r.id === this.selectedReporte?.id) ?? this.selectedReporte;
        }
        this.scheduleDetectChanges();
      },
      error: () => {
        this.operadores = [];
        this.scheduleDetectChanges();
      }
    });
  }

  loadReportes(options: { clearFeedback?: boolean } = {}) {
    const clearFeedback = options.clearFeedback ?? true;
    this.loading = true;
    if (clearFeedback) {
      this.error = '';
      this.success = '';
    }
    this.empty = false;

    this.reportesService.listarTodos().subscribe({
      next: (data) => {
        this.reportes = this.ordenarReportesRecientes(data).map((r) => this.toVista(r));
        this.empty = this.reportesFiltrados.length === 0;
        if (!this.empty) {
          const keep = this.selectedReporte
            ? this.reportesFiltrados.find((r) => r.id === this.selectedReporte!.id)
            : null;
          this.selectedReporte = keep ?? this.reportesFiltrados[0];
        } else {
          this.selectedReporte = null;
        }
        this.loading = false;
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.reportes = [];
        this.selectedReporte = null;
        this.empty = false;
        this.scheduleDetectChanges();
      }
    });
  }

  onSelectReporte(reporte: ReporteVista) {
    this.selectedReporte = reporte;
    this.mostrarDerivar = false;
  }

  onFiltrosChange() {
    this.empty = this.reportesFiltrados.length === 0;
    if (this.selectedReporte && this.reportesFiltrados.some((r) => r.id === this.selectedReporte!.id)) {
      this.scheduleDetectChanges();
      return;
    }
    this.selectedReporte = this.reportesFiltrados[0] ?? null;
    this.mostrarDerivar = false;
    this.scheduleDetectChanges();
  }

  onLimpiarFiltros() {
    this.statusFilter = '';
    this.tipoFilter = '';
    this.zonaFilter = '';
    this.mesFilter = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.onFiltrosChange();
  }

  get reportesFiltrados(): ReporteVista[] {
    const tipo = this.normalizar(this.tipoFilter);
    const zona = this.normalizar(this.zonaFilter);
    const desde = this.fechaDesde ? new Date(`${this.fechaDesde}T00:00:00`).getTime() : null;
    const hasta = this.fechaHasta ? new Date(`${this.fechaHasta}T23:59:59`).getTime() : null;

    return this.reportes.filter((reporte) => {
      const fecha = this.fechaMs(reporte.fechaCreacion);
      return (!this.statusFilter || reporte.estado === this.statusFilter)
        && (!tipo || this.normalizar(reporte.tipo).includes(tipo))
        && (!zona || this.normalizar(reporte.zona).includes(zona))
        && (!this.mesFilter || this.mesClave(reporte.fechaCreacion) === this.mesFilter)
        && (desde === null || fecha >= desde)
        && (hasta === null || fecha <= hasta);
    });
  }

  get mesesDisponibles(): { value: string; label: string }[] {
    const meses = new Map<string, string>();
    this.reportes.forEach((reporte) => {
      const fecha = new Date(reporte.fechaCreacion);
      if (Number.isNaN(fecha.getTime())) return;
      const value = this.mesClave(reporte.fechaCreacion);
      const label = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(fecha);
      meses.set(value, this.capitalize(label));
    });
    return [...meses.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([value, label]) => ({ value, label }));
  }

  onMostrarDerivar() {
    this.mostrarDerivar = true;
    this.success = '';
    this.error = '';
    if (this.operadores.length > 0) {
      this.responsableId = this.operadores[0].id;
    }
  }

  onCancelarDerivar() {
    this.mostrarDerivar = false;
  }

  onDerivar() {
    if (!this.selectedReporte) return;
    if (!this.responsableId) {
      this.error = 'Selecciona un operador responsable.';
      return;
    }
    this.submitting = true;
    this.error = '';
    this.success = '';

    this.casosService.crear(this.selectedReporte.id, this.responsableId, this.prioridad).subscribe({
      next: (caso) => {
        this.submitting = false;
        this.success = `Reporte derivado correctamente al caso #${caso.id}.`;
        const selectedId = this.selectedReporte?.id ?? null;
        this.mostrarDerivar = false;
        this.loadReportes({ clearFeedback: false });
        if (selectedId != null) {
          this.selectedReporte = this.reportesFiltrados.find((r) => r.id === selectedId) ?? this.selectedReporte;
        }
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.error = apiErrorMessage(error);
        this.scheduleDetectChanges();
      }
    });
  }

  private scheduleDetectChanges(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }

  private ordenarReportesRecientes(reportes: ReporteResponse[]): ReporteResponse[] {
    return [...reportes].sort((a, b) => this.fechaMs(b.fechaCreacion) - this.fechaMs(a.fechaCreacion));
  }

  private fechaMs(fecha: string | undefined): number {
    return fecha ? new Date(fecha).getTime() : 0;
  }

  statusClass(estado: ApiReportStatus): string {
    return reportStatusClass(estado);
  }

  /** Nombre del vecino; si aún no llegó la lista, muestra el identificador. */
  private nombreUsuario(usuarioId: number): string {
    return this.nombresUsuarios.get(usuarioId) ?? `Usuario #${usuarioId}`;
  }

  private toVista(r: ReporteResponse): ReporteVista {
    return {
      id: r.id,
      fecha: formatDateTime(r.fechaCreacion),
      fechaCorta: new Date(r.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      fechaCreacion: r.fechaCreacion,
      usuarioId: r.usuarioId,
      ciudadano: this.nombreUsuario(r.usuarioId),
      zona: r.zona,
      tipo: r.tipo,
      estado: r.estado,
      estadoLabel: reportStatusLabel(r.estado),
      descripcion: r.descripcion,
      ubicacion: r.direccion,
      reportadoPor: this.nombreUsuario(r.usuarioId),
      evidencia: r.fotoUrl || r.fotoUrls?.[0],
      evidenciaUrls: this.evidenciasReporte(r)
    };
  }

  private evidenciasReporte(reporte: ReporteResponse): string[] {
    const urls = [...(reporte.fotoUrls ?? []), reporte.fotoUrl]
      .filter((url): url is string => Boolean(url?.trim()));
    return [...new Set(urls)];
  }

  private mesClave(value: string): string {
    const fecha = new Date(value);
    if (Number.isNaN(fecha.getTime())) return '';
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  private normalizar(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
