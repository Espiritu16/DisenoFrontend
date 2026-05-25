import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiCaseStatus, CasoResponse } from '../../../core/api/api-models';
import { CasosService } from '../../../core/api/casos.service';
import { UploadService } from '../../../core/api/upload.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { caseStatusLabel } from '../../../core/api/api-mappers';

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

  constructor(private casosService: CasosService, private uploadService: UploadService) {}

  ngOnInit() {
    this.loadCasos();
  }

  loadCasos() {
    this.casosService.listar().subscribe({
      next: (casos) => {
        this.casos = casos;
        if (!this.selectedCaso && casos.length) this.onSelectCaso(casos[0]);
      },
      error: (error: unknown) => { this.message = apiErrorMessage(error); }
    });
  }

  onSelectCaso(caso: CasoResponse) {
    this.selectedCaso = caso;
    this.estado = caso.estado;
    this.observaciones = caso.observaciones ?? '';
    this.evidenciaFiles = [];
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenciaFiles = Array.from(input.files ?? []);
  }

  onGuardarCambios() {
    if (!this.selectedCaso) return;
    const guardar = (urls: string[]) => {
      this.casosService.actualizarEstado(this.selectedCaso!.id, this.estado, this.observaciones, urls[0], urls).subscribe({
        next: (caso) => {
          this.message = `Caso #${caso.id} actualizado.`;
          this.onSelectCaso(caso);
          this.loadCasos();
        },
        error: (error: unknown) => { this.message = apiErrorMessage(error); }
      });
    };
    if (this.evidenciaFiles.length) {
      this.uploadService.subirCasos(this.evidenciaFiles).subscribe({
        next: (res) => guardar(res.archivos?.map((item) => item.url) ?? [res.url]),
        error: (error: unknown) => { this.message = apiErrorMessage(error); }
      });
      return;
    }
    guardar(this.selectedCaso.evidenciaCierre ? [this.selectedCaso.evidenciaCierre] : []);
  }

  onCerrarCaso() {
    this.estado = 'RESUELTO';
    this.onGuardarCambios();
  }

  statusLabel = caseStatusLabel;
}
