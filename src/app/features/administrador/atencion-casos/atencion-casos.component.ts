import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiCasePriority, ApiCaseStatus, CasoResponse } from '../../../core/api/api-models';
import { CasosService } from '../../../core/api/casos.service';
import { UploadService } from '../../../core/api/upload.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { caseStatusClass, caseStatusLabel, formatDateTime } from '../../../core/api/api-mappers';
import { UsuariosService } from '../../../core/api/usuarios.service';

@Component({
  selector: 'app-atencion-casos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-casos.component.html',
  styleUrl: './atencion-casos.component.css'
})
export class AtencionCasosComponent implements OnInit {
  casos: CasoResponse[] = [];
  selectedCaso: CasoResponse | null = null;
  estado: ApiCaseStatus = 'EN_PROCESO';
  observaciones = '';
  evidenciaFiles: File[] = [];
  message = '';
  loading = false;
  saving = false;
  searchTerm = '';
  estadoFilter: '' | ApiCaseStatus = '';
  prioridadFilter: '' | ApiCasePriority = '';
  mesFilter = '';
  fechaDesde = '';
  fechaHasta = '';

  /** Nombres de los responsables, para no mostrar sólo su identificador. */
  private nombresUsuarios = new Map<number, string>();

  constructor(
    private casosService: CasosService,
    private uploadService: UploadService,
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadResponsables();
    this.loadCasos();
  }

  loadResponsables() {
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.nombresUsuarios = new Map(usuarios.map((u) => [u.id, u.nombre]));
        this.cdr.detectChanges();
      },
      error: () => {
        this.nombresUsuarios = new Map();
      }
    });
  }

  /** Nombre del responsable; si aún no llegó la lista, muestra el identificador. */
  nombreResponsable(usuarioId: number | null | undefined): string {
    if (usuarioId == null) return 'Sin asignar';
    return this.nombresUsuarios.get(usuarioId) ?? `Usuario #${usuarioId}`;
  }

  loadCasos() {
    this.loading = true;
    this.casosService.listar().subscribe({
      next: (casos) => {
        this.casos = this.ordenarCasosRecientes(casos);
        const visibles = this.casosFiltrados;
        const seleccionadoVigente = this.selectedCaso
          ? visibles.find((caso) => caso.id === this.selectedCaso!.id)
          : null;
        this.selectedCaso = seleccionadoVigente ?? visibles[0] ?? null;
        if (this.selectedCaso) {
          this.estado = this.selectedCaso.estado;
          this.observaciones = this.selectedCaso.observaciones ?? '';
          this.evidenciaFiles = [];
        }
        this.loading = false;
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.message = apiErrorMessage(error);
        this.scheduleDetectChanges();
      }
    });
  }

  get casosFiltrados(): CasoResponse[] {
    const term = this.normalizar(this.searchTerm);
    const desde = this.fechaDesde ? new Date(`${this.fechaDesde}T00:00:00`).getTime() : null;
    const hasta = this.fechaHasta ? new Date(`${this.fechaHasta}T23:59:59`).getTime() : null;

    return this.casos.filter((caso) => {
      const fecha = this.fechaReferenciaMs(caso);
      const texto = this.normalizar([
        caso.id,
        `REP-${caso.reporteId}`,
        caso.reporteTipo,
        caso.reporteZona,
        caso.reporteDescripcion,
        caso.responsableId,
        this.statusLabel(caso.estado),
        caso.prioridad
      ].filter(Boolean).join(' '));

      return (!term || texto.includes(term))
        && (!this.estadoFilter || caso.estado === this.estadoFilter)
        && (!this.prioridadFilter || caso.prioridad === this.prioridadFilter)
        && (!this.mesFilter || this.mesClave(caso) === this.mesFilter)
        && (desde === null || fecha >= desde)
        && (hasta === null || fecha <= hasta);
    });
  }

  get mesesDisponibles(): { value: string; label: string }[] {
    const meses = new Map<string, string>();
    this.casos.forEach((caso) => {
      const fecha = this.fechaReferencia(caso);
      if (!fecha) return;
      const value = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(fecha);
      meses.set(value, this.capitalize(label));
    });
    return [...meses.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([value, label]) => ({ value, label }));
  }

  onSelectCaso(caso: CasoResponse) {
    this.selectedCaso = caso;
    this.estado = caso.estado;
    this.observaciones = caso.observaciones ?? '';
    this.evidenciaFiles = [];
    this.scheduleDetectChanges();
  }

  onFiltrosChange(): void {
    const filtrados = this.casosFiltrados;
    if (this.selectedCaso && filtrados.some((caso) => caso.id === this.selectedCaso!.id)) {
      this.scheduleDetectChanges();
      return;
    }
    this.selectedCaso = filtrados[0] ?? null;
    if (this.selectedCaso) {
      this.estado = this.selectedCaso.estado;
      this.observaciones = this.selectedCaso.observaciones ?? '';
      this.evidenciaFiles = [];
    }
    this.scheduleDetectChanges();
  }

  onLimpiarFiltros(): void {
    this.searchTerm = '';
    this.estadoFilter = '';
    this.prioridadFilter = '';
    this.mesFilter = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.onFiltrosChange();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const invalid = files.find((file) => !this.isSupportedImage(file));
    if (invalid) {
      this.evidenciaFiles = [];
      this.message = 'Solo se permiten imagenes JPG, PNG o WEBP.';
      input.value = '';
      this.scheduleDetectChanges();
      return;
    }
    this.evidenciaFiles = files;
    this.message = '';
    this.scheduleDetectChanges();
  }

  private isSupportedImage(file: File): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase());
  }

  onGuardarCambios() {
    if (!this.selectedCaso || this.saving) return;
    if (this.selectedCaso.estado === 'RESUELTO') {
      this.estado = this.selectedCaso.estado;
      this.message = 'El caso ya está resuelto y no admite más cambios.';
      this.scheduleDetectChanges();
      return;
    }
    this.saving = true;
    this.message = '';
    const guardar = (urls: string[]) => {
      this.casosService.actualizarEstado(this.selectedCaso!.id, this.estado, this.observaciones, urls[0], urls).subscribe({
        next: (caso) => {
          this.saving = false;
          this.message = `Caso #${caso.id} actualizado.`;
          this.onSelectCaso(caso);
          this.loadCasos();
        },
        error: (error: unknown) => {
          this.saving = false;
          this.message = apiErrorMessage(error);
          this.scheduleDetectChanges();
        }
      });
    };
    if (this.evidenciaFiles.length) {
      this.uploadService.subirCasos(this.evidenciaFiles).subscribe({
        next: (res) => guardar(res.archivos?.map((item) => item.url) ?? [res.url]),
        error: (error: unknown) => {
          this.saving = false;
          this.message = apiErrorMessage(error);
          this.scheduleDetectChanges();
        }
      });
      return;
    }
    guardar(this.selectedCaso.evidenciaCierre ? [this.selectedCaso.evidenciaCierre] : []);
  }

  private scheduleDetectChanges(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }

  private ordenarCasosRecientes(casos: CasoResponse[]): CasoResponse[] {
    return [...casos].sort((a, b) => {
      const fechaDiff = this.fechaReferenciaMs(b) - this.fechaReferenciaMs(a);
      return fechaDiff || b.id - a.id;
    });
  }

  private fechaReferencia(caso: CasoResponse): Date | null {
    const fecha = caso.reporteFechaCreacion || caso.fechaAsignacion;
    if (!fecha) return null;
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private fechaReferenciaMs(caso: CasoResponse): number {
    return this.fechaReferencia(caso)?.getTime() ?? 0;
  }

  private mesClave(caso: CasoResponse): string {
    const fecha = this.fechaReferencia(caso);
    if (!fecha) return '';
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

  onCerrarCaso() {
    if (this.selectedCaso?.estado === 'RESUELTO') {
      this.message = 'El caso ya está resuelto y no admite más cambios.';
      this.scheduleDetectChanges();
      return;
    }
    this.estado = 'RESUELTO';
    this.onGuardarCambios();
  }

  get selectedCaseClosed(): boolean {
    return this.selectedCaso?.estado === 'RESUELTO';
  }

  statusLabel = caseStatusLabel;
  statusClass = caseStatusClass;

  priorityClass(prioridad: string): string {
    return prioridad.toLowerCase();
  }

  formatFecha(value?: string): string {
    return formatDateTime(value);
  }
}
