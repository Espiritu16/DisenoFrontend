import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../../core/api/api-error';
import {
  AlertaServicioRequest,
  AlertaServicioResponse,
  ApiAlertSeverity,
  ApiServiceAlertType
} from '../../../core/api/api-models';
import { EstadoServicioService } from '../../../core/api/estado-servicio.service';

@Component({
  selector: 'app-estado-servicio-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-status">
      <div class="admin-status__header">
        <div>
          <span>Operación</span>
          <h1>Estado del servicio</h1>
          <p>Publica alertas visibles para ciudadanía, operación y autoridades.</p>
        </div>
      </div>

      <div class="feedback error" *ngIf="error">{{ error }}</div>
      <div class="feedback success" *ngIf="success">{{ success }}</div>

      <form class="admin-status__form" (ngSubmit)="crearAlerta()">
        <label>
          Tipo
          <select name="tipo" [(ngModel)]="form.tipo" required>
            <option *ngFor="let tipo of tipos" [ngValue]="tipo.value">{{ tipo.label }}</option>
          </select>
        </label>
        <label>
          Severidad
          <select name="severidad" [(ngModel)]="form.severidad">
            <option *ngFor="let severidad of severidades" [ngValue]="severidad.value">{{ severidad.label }}</option>
          </select>
        </label>
        <label>
          Título
          <input name="titulo" [(ngModel)]="form.titulo" maxlength="160" required />
        </label>
        <label>
          Descripción
          <textarea name="descripcion" [(ngModel)]="form.descripcion" rows="4" maxlength="800" required></textarea>
        </label>
        <label>
          Inicio
          <input name="iniciaEn" type="datetime-local" [(ngModel)]="form.iniciaEn" />
        </label>
        <label>
          Fin
          <input name="finalizaEn" type="datetime-local" [(ngModel)]="form.finalizaEn" />
        </label>
        <button class="btn-primary" type="submit" [disabled]="submitting">
          {{ submitting ? 'Publicando...' : 'Publicar alerta' }}
        </button>
      </form>

      <section class="admin-status__list">
        <h2>Alertas vigentes</h2>
        <p *ngIf="loading">Cargando alertas...</p>
        <p *ngIf="!loading && !alertas.length">No hay alertas vigentes.</p>
        <article *ngFor="let alerta of alertas">
          <strong>{{ alerta.titulo }}</strong>
          <span>{{ alerta.tipo }} · {{ alerta.severidad }}</span>
          <p>{{ alerta.descripcion }}</p>
        </article>
      </section>
    </section>
  `,
  styles: [`
    .admin-status { display: grid; gap: 1rem; }
    .admin-status__header { display: flex; justify-content: space-between; gap: 1rem; align-items: start; }
    .admin-status__header span { color: #2563eb; font-weight: 900; text-transform: uppercase; font-size: .75rem; letter-spacing: .08em; }
    .admin-status__header h1 { margin: .2rem 0; color: #0f172a; }
    .admin-status__header p { margin: 0; color: #64748b; }
    .admin-status__form, .admin-status__list { background: #fff; border: 1px solid #dbe4f0; border-radius: .5rem; padding: 1rem; }
    .admin-status__form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
    .admin-status__form label { display: grid; gap: .35rem; color: #334155; font-weight: 800; }
    .admin-status__form input, .admin-status__form select, .admin-status__form textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: .45rem; padding: .65rem .75rem; color: #0f172a; }
    .admin-status__form textarea, .admin-status__form button { grid-column: 1 / -1; }
    .btn-primary { min-height: 44px; border: 0; border-radius: .5rem; background: #2563eb; color: #fff; font-weight: 900; cursor: pointer; }
    .btn-primary:disabled { opacity: .65; cursor: progress; }
    .feedback { border-radius: .5rem; padding: .8rem 1rem; font-weight: 800; }
    .feedback.error { color: #991b1b; background: #fee2e2; }
    .feedback.success { color: #065f46; background: #d1fae5; }
    .admin-status__list { display: grid; gap: .8rem; }
    .admin-status__list h2 { margin: 0; color: #0f172a; }
    .admin-status__list article { border-left: 3px solid #2563eb; padding-left: .8rem; display: grid; gap: .25rem; }
    .admin-status__list article strong { color: #0f172a; }
    .admin-status__list article span, .admin-status__list article p { margin: 0; color: #64748b; }
    @media (max-width: 760px) { .admin-status__form { grid-template-columns: 1fr; } }
  `]
})
export class EstadoServicioAdminComponent implements OnInit {
  readonly tipos: Array<{ value: ApiServiceAlertType; label: string }> = [
    { value: 'CORTE_PROGRAMADO', label: 'Corte programado' },
    { value: 'CORTE_NO_PROGRAMADO', label: 'Corte no programado' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'RIESGO_DESABASTECIMIENTO', label: 'Riesgo de desabastecimiento' },
    { value: 'INFORMATIVA', label: 'Informativa' }
  ];
  readonly severidades: Array<{ value: ApiAlertSeverity; label: string }> = [
    { value: 'INFO', label: 'Informativa' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' }
  ];

  form: AlertaServicioRequest = {
    tipo: 'INFORMATIVA',
    severidad: 'INFO',
    estado: 'ACTIVA',
    titulo: '',
    descripcion: ''
  };
  alertas: AlertaServicioResponse[] = [];
  loading = false;
  submitting = false;
  error = '';
  success = '';

  constructor(private estadoServicio: EstadoServicioService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  crearAlerta(): void {
    this.error = '';
    this.success = '';
    const titulo = this.form.titulo.trim();
    const descripcion = this.form.descripcion.trim();
    if (!titulo || !descripcion) {
      this.error = 'Completa título y descripción.';
      return;
    }
    this.submitting = true;
    this.estadoServicio.crearAlerta({ ...this.form, titulo, descripcion }).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Alerta publicada correctamente.';
        this.form = { tipo: 'INFORMATIVA', severidad: 'INFO', estado: 'ACTIVA', titulo: '', descripcion: '' };
        this.cargarAlertas();
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.error = apiErrorMessage(error);
        this.scheduleDetectChanges();
      }
    });
  }

  private cargarAlertas(): void {
    this.loading = true;
    this.estadoServicio.listarAlertas().subscribe({
      next: (alertas) => {
        this.loading = false;
        this.alertas = alertas;
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.scheduleDetectChanges();
      }
    });
  }

  private scheduleDetectChanges(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }
}
