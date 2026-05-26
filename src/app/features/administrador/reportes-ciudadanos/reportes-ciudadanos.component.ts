import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiCasePriority, ApiReportStatus, ReporteResponse, UsuarioResponse } from '../../../core/api/api-models';
import { reportStatusLabel, formatDateTime, reportStatusClass } from '../../../core/api/api-mappers';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ReportesService } from '../../../core/api/reportes.service';
import { CasosService } from '../../../core/api/casos.service';
import { UsuariosService } from '../../../core/api/usuarios.service';

interface ReporteVista {
  id: number;
  fecha: string;
  ciudadano: string;
  zona: string;
  tipo: string;
  estado: ApiReportStatus;
  estadoLabel: string;
  descripcion: string;
  ubicacion: string;
  reportadoPor: string;
  evidencia?: string;
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

  loading = false;
  empty = false;
  error = '';
  success = '';
  submitting = false;
  mostrarDerivar = false;

  statusFilter: '' | ApiReportStatus = '';
  tipoFilter = '';
  zonaFilter = '';
  fechaDesde = '';
  fechaHasta = '';

  responsableId: number | null = null;
  prioridad: ApiCasePriority = 'MEDIA';

  constructor(
    private reportesService: ReportesService,
    private casosService: CasosService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit() {
    this.loadOperadores();
    this.loadReportes();
  }

  loadOperadores() {
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.operadores = usuarios.filter((u) => u.rol === 'OPERADOR' && u.estado === 'ACTIVO');
      },
      error: () => {
        this.operadores = [];
      }
    });
  }

  loadReportes() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.empty = false;

    this.reportesService.listarTodos({
      estado: this.statusFilter || undefined,
      tipo: this.tipoFilter || undefined,
      zona: this.zonaFilter || undefined,
      fechaDesde: this.toIsoDateBoundary(this.fechaDesde, true) || undefined,
      fechaHasta: this.toIsoDateBoundary(this.fechaHasta, false) || undefined
    }).subscribe({
      next: (data) => {
        this.reportes = data.map((r) => this.toVista(r));
        this.empty = this.reportes.length === 0;
        if (!this.empty) {
          const keep = this.selectedReporte
            ? this.reportes.find((r) => r.id === this.selectedReporte!.id)
            : null;
          this.selectedReporte = keep ?? this.reportes[0];
        } else {
          this.selectedReporte = null;
        }
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.reportes = [];
        this.selectedReporte = null;
        this.empty = false;
      }
    });
  }

  onSelectReporte(reporte: ReporteVista) {
    this.selectedReporte = reporte;
    this.mostrarDerivar = false;
  }

  onFiltrar() {
    this.loadReportes();
  }

  onLimpiarFiltros() {
    this.statusFilter = '';
    this.tipoFilter = '';
    this.zonaFilter = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.loadReportes();
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
        this.loadReportes();
        if (selectedId != null) {
          this.selectedReporte = this.reportes.find((r) => r.id === selectedId) ?? this.selectedReporte;
        }
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.error = apiErrorMessage(error);
      }
    });
  }

  statusClass(estado: ApiReportStatus): string {
    return reportStatusClass(estado);
  }

  private toVista(r: ReporteResponse): ReporteVista {
    return {
      id: r.id,
      fecha: formatDateTime(r.fechaCreacion),
      ciudadano: `Usuario #${r.usuarioId}`,
      zona: r.zona,
      tipo: r.tipo,
      estado: r.estado,
      estadoLabel: reportStatusLabel(r.estado),
      descripcion: r.descripcion,
      ubicacion: r.direccion,
      reportadoPor: `Usuario #${r.usuarioId}`,
      evidencia: r.fotoUrl || r.fotoUrls?.[0]
    };
  }

  private toIsoDateBoundary(value: string, start: boolean): string | null {
    if (!value) return null;
    const suffix = start ? 'T00:00:00' : 'T23:59:59';
    return `${value}${suffix}`;
  }
}
