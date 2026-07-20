import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { apiErrorMessage } from '../../../core/api/api-error';
import {
  AlertaServicioRequest,
  AlertaServicioResponse,
  ApiAlertSeverity,
  ApiServiceAlertType
} from '../../../core/api/api-models';
import { EstadoServicioService } from '../../../core/api/estado-servicio.service';

type AlertForm = FormGroup<{
  tipo: FormControl<ApiServiceAlertType>;
  severidad: FormControl<ApiAlertSeverity>;
  estado: FormControl<'ACTIVA'>;
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  iniciaEn: FormControl<string>;
  finalizaEn: FormControl<string>;
}>;

@Component({
  selector: 'app-estado-servicio-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

      <form class="admin-status__form" [formGroup]="alertForm" (ngSubmit)="crearAlerta()">
        <label>
          Tipo
          <select formControlName="tipo" required>
            <option *ngFor="let tipo of tipos" [ngValue]="tipo.value">{{ tipo.label }}</option>
          </select>
        </label>
        <label>
          Severidad
          <select formControlName="severidad">
            <option *ngFor="let severidad of severidades" [ngValue]="severidad.value">{{ severidad.label }}</option>
          </select>
        </label>
        <label>
          Título
          <input
            formControlName="titulo"
            maxlength="160"
            required
            [attr.aria-invalid]="campoInvalido('titulo')"
            aria-describedby="alert-title-error"
          />
          <small id="alert-title-error" class="field-error" *ngIf="campoInvalido('titulo')">
            Ingresa un título de hasta 160 caracteres.
          </small>
        </label>
        <label>
          Descripción
          <textarea
            formControlName="descripcion"
            rows="4"
            maxlength="800"
            required
            [attr.aria-invalid]="campoInvalido('descripcion')"
            aria-describedby="alert-description-error"
          ></textarea>
          <small id="alert-description-error" class="field-error" *ngIf="campoInvalido('descripcion')">
            Ingresa una descripción de hasta 800 caracteres.
          </small>
        </label>
        <label>
          Inicio
          <input formControlName="iniciaEn" type="datetime-local" [attr.aria-invalid]="alertForm.hasError('dateRange')" />
        </label>
        <label>
          Fin
          <input formControlName="finalizaEn" type="datetime-local" [attr.aria-invalid]="alertForm.hasError('dateRange')" />
          <small class="field-error" *ngIf="alertForm.hasError('dateRange') && (alertForm.touched || alertForm.dirty)">
            La fecha de fin no puede ser anterior al inicio.
          </small>
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
          <div>
            <strong>{{ alerta.titulo }}</strong>
            <span>{{ etiquetaTipo(alerta.tipo) }} · {{ etiquetaSeveridad(alerta.severidad) }} · {{ alerta.estado }}</span>
          </div>
          <p>{{ alerta.descripcion }}</p>
          <small>{{ alerta.zona || 'Todas las zonas' }} · {{ rangoAlerta(alerta) }}</small>
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
    .admin-status__form input[aria-invalid="true"], .admin-status__form textarea[aria-invalid="true"] { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, .12); }
    .admin-status__form textarea, .admin-status__form button { grid-column: 1 / -1; }
    .field-error { color: #b91c1c; font-size: .8rem; font-weight: 800; }
    .btn-primary { min-height: 44px; border: 0; border-radius: .5rem; background: #2563eb; color: #fff; font-weight: 900; cursor: pointer; }
    .btn-primary:disabled { opacity: .65; cursor: progress; }
    .feedback { border-radius: .5rem; padding: .8rem 1rem; font-weight: 800; }
    .feedback.error { color: #991b1b; background: #fee2e2; }
    .feedback.success { color: #065f46; background: #d1fae5; }
    .admin-status__list { display: grid; gap: .8rem; }
    .admin-status__list h2 { margin: 0; color: #0f172a; }
    .admin-status__list article { border-left: 3px solid #2563eb; padding-left: .8rem; display: grid; gap: .35rem; }
    .admin-status__list article strong { color: #0f172a; }
    .admin-status__list article span, .admin-status__list article p, .admin-status__list article small { margin: 0; color: #64748b; }
    .admin-status__list article small { font-weight: 800; }
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

  readonly alertForm: AlertForm = new FormGroup({
    tipo: new FormControl<ApiServiceAlertType>('INFORMATIVA', { nonNullable: true, validators: [Validators.required] }),
    severidad: new FormControl<ApiAlertSeverity>('INFO', { nonNullable: true }),
    estado: new FormControl<'ACTIVA'>('ACTIVA', { nonNullable: true }),
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(160)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(800)] }),
    iniciaEn: new FormControl('', { nonNullable: true }),
    finalizaEn: new FormControl('', { nonNullable: true })
  }, { validators: [rangoFechasValido] });
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
    this.alertForm.markAllAsTouched();
    if (this.alertForm.invalid) {
      this.error = this.alertForm.hasError('dateRange')
        ? 'La fecha de fin no puede ser anterior al inicio.'
        : 'Completa los campos obligatorios antes de publicar.';
      return;
    }
    const values = this.alertForm.getRawValue();
    const titulo = values.titulo.trim();
    const descripcion = values.descripcion.trim();
    const payload: AlertaServicioRequest = {
      tipo: values.tipo,
      severidad: values.severidad,
      estado: values.estado,
      titulo,
      descripcion,
      iniciaEn: values.iniciaEn || undefined,
      finalizaEn: values.finalizaEn || undefined
    };
    this.submitting = true;
    this.estadoServicio.crearAlerta(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Alerta publicada correctamente.';
        this.alertForm.reset({
          tipo: 'INFORMATIVA',
          severidad: 'INFO',
          estado: 'ACTIVA',
          titulo: '',
          descripcion: '',
          iniciaEn: '',
          finalizaEn: ''
        });
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

  campoInvalido(nombre: 'titulo' | 'descripcion'): boolean {
    const control = this.alertForm.controls[nombre];
    return control.invalid && (control.dirty || control.touched);
  }

  etiquetaTipo(tipo: ApiServiceAlertType): string {
    return this.tipos.find((option) => option.value === tipo)?.label ?? tipo;
  }

  etiquetaSeveridad(severidad: ApiAlertSeverity): string {
    return this.severidades.find((option) => option.value === severidad)?.label ?? severidad;
  }

  rangoAlerta(alerta: AlertaServicioResponse): string {
    if (alerta.iniciaEn && alerta.finalizaEn) {
      return `${this.formatearFechaHora(alerta.iniciaEn)} - ${this.formatearFechaHora(alerta.finalizaEn)}`;
    }
    if (alerta.iniciaEn) {
      return `Desde ${this.formatearFechaHora(alerta.iniciaEn)}`;
    }
    if (alerta.finalizaEn) {
      return `Hasta ${this.formatearFechaHora(alerta.finalizaEn)}`;
    }
    return 'Vigencia inmediata';
  }

  private formatearFechaHora(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }
}

function rangoFechasValido(control: AbstractControl): ValidationErrors | null {
  const iniciaEn = control.get('iniciaEn')?.value;
  const finalizaEn = control.get('finalizaEn')?.value;
  if (!iniciaEn || !finalizaEn) {
    return null;
  }
  return new Date(finalizaEn).getTime() < new Date(iniciaEn).getTime() ? { dateRange: true } : null;
}
