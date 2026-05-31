import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiCaseStatus, CasoResponse } from '../../../core/api/api-models';
import { CasosService } from '../../../core/api/casos.service';
import { UploadService } from '../../../core/api/upload.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { caseStatusClass, caseStatusLabel } from '../../../core/api/api-mappers';

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

  constructor(
    private casosService: CasosService,
    private uploadService: UploadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCasos();
  }

  loadCasos() {
    this.loading = true;
    this.casosService.listar().subscribe({
      next: (casos) => {
        this.casos = casos;
        if (!this.selectedCaso && casos.length) this.onSelectCaso(casos[0]);
        if (this.selectedCaso) {
          this.selectedCaso = casos.find((caso) => caso.id === this.selectedCaso!.id) ?? this.selectedCaso;
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

  onSelectCaso(caso: CasoResponse) {
    this.selectedCaso = caso;
    this.estado = caso.estado;
    this.observaciones = caso.observaciones ?? '';
    this.evidenciaFiles = [];
    this.scheduleDetectChanges();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenciaFiles = Array.from(input.files ?? []);
    this.message = '';
    this.scheduleDetectChanges();
  }

  onGuardarCambios() {
    if (!this.selectedCaso || this.saving) return;
    if (this.selectedCaso.estado === 'RESUELTO') {
      this.estado = this.selectedCaso.estado;
      this.message = 'El caso ya está resuelto y no admite más cambios.';
      this.scheduleDetectChanges();
      return;
    }
    if (this.estado === 'RESUELTO' && !this.evidenciaFiles.length && !this.selectedCaso.evidenciaCierre) {
      this.message = 'Debes adjuntar evidencia para cerrar como Resuelto.';
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
}
