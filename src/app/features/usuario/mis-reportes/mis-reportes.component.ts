import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ApiReportStatus, DetalleTrazabilidadReporte, HistorialCambio, ReporteResponse } from '../../../core/api/api-models';
import { ReportesService } from '../../../core/api/reportes.service';
import { AquaFooterComponent } from '../../../shared/public/aqua-footer/aqua-footer.component';
import { AquaHeaderComponent } from '../../../shared/public/aqua-header/aqua-header.component';
import { AquaMobileNavComponent } from '../../../shared/public/aqua-mobile-nav/aqua-mobile-nav.component';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, AquaHeaderComponent, AquaFooterComponent, AquaMobileNavComponent],
  templateUrl: './mis-reportes.component.html',
  styleUrl: './mis-reportes.component.css'
})
export class MisReportesComponent implements OnInit, OnDestroy {
  @ViewChild('reportsPanel') private reportsPanel?: ElementRef<HTMLElement>;

  queryCode = '';
  consultedCode = '';
  loading = false;
  error = '';
  reports: ReporteResponse[] = [];
  selectedReport?: ReporteResponse;
  trazabilidad?: DetalleTrazabilidadReporte;
  trazabilidadLoading = false;
  trazabilidadError = '';

  constructor(private reportesService: ReportesService, private cdr: ChangeDetectorRef) {}

  get statusCards(): Array<{ label: string; value: string; tone: string }> {
    const pendientes = this.countByStatus(['PENDIENTE']);
    const enAtencion = this.countByStatus(['EN_PROCESO', 'ESCALADO']);
    const resueltos = this.countByStatus(['RESUELTO']);
    return [
      { label: 'Pendientes', value: this.padCount(pendientes), tone: 'pending' },
      { label: 'En atención', value: this.padCount(enAtencion), tone: 'process' },
      { label: 'Resueltos', value: this.padCount(resueltos), tone: 'done' }
    ];
  }

  private scrollTimeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
  }

  consultReport(): void {
    this.consultedCode = this.queryCode.trim();
    const normalized = this.consultedCode.toLowerCase().replace(/^rep-/, '');
    this.selectedReport = this.reports.find((report) => {
      const id = String(report.id);
      return id === normalized || `rep-${id}` === this.consultedCode.toLowerCase();
    }) ?? this.reports[0];
    if (this.selectedReport) {
      this.loadTrazabilidad(this.selectedReport.id);
    }
    this.focusReportsPanel();
  }

  selectReport(report: ReporteResponse): void {
    this.selectedReport = report;
    this.consultedCode = `REP-${report.id}`;
    this.loadTrazabilidad(report.id);
  }

  trackReport(_index: number, report: ReporteResponse): number {
    return report.id;
  }

  statusLabel(status: ApiReportStatus): string {
    const labels: Record<ApiReportStatus, string> = {
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En atención',
      RESUELTO: 'Resuelto',
      DUPLICADO: 'Duplicado',
      RECHAZADO: 'Rechazado',
      ESCALADO: 'Escalado'
    };
    return labels[status];
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  historialCompleto(): HistorialCambio[] {
    const reporte = this.trazabilidad?.historialReporte ?? [];
    const caso = this.trazabilidad?.historialCaso ?? [];
    return [...reporte, ...caso].sort((a, b) => new Date(b.fechaCambio).getTime() - new Date(a.fechaCambio).getTime());
  }

  private loadReports(): void {
    this.loading = true;
    this.error = '';
    this.reportesService.listarMisReportes().subscribe({
      next: (reports) => {
        this.loading = false;
        this.reports = reports;
        this.selectedReport = reports[0];
        if (this.selectedReport) {
          this.consultedCode = `REP-${this.selectedReport.id}`;
          this.loadTrazabilidad(this.selectedReport.id);
        }
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
        this.reports = [];
        this.selectedReport = undefined;
        this.scheduleDetectChanges();
      }
    });
  }

  private loadTrazabilidad(reportId: number): void {
    this.trazabilidadLoading = true;
    this.trazabilidadError = '';
    this.trazabilidad = undefined;
    this.reportesService.trazabilidad(reportId).subscribe({
      next: (trazabilidad) => {
        this.trazabilidadLoading = false;
        this.trazabilidad = trazabilidad;
        this.scheduleDetectChanges();
      },
      error: (error: unknown) => {
        this.trazabilidadLoading = false;
        this.trazabilidadError = apiErrorMessage(error);
        this.scheduleDetectChanges();
      }
    });
  }

  private countByStatus(statuses: ApiReportStatus[]): number {
    return this.reports.filter((report) => statuses.includes(report.estado)).length;
  }

  private padCount(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private scheduleDetectChanges(): void {
    queueMicrotask(() => this.cdr.detectChanges());
  }

  private focusReportsPanel(): void {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }

    this.scrollTimeoutId = setTimeout(() => {
      const panel = this.reportsPanel?.nativeElement;
      if (typeof panel?.scrollIntoView !== 'function') {
        return;
      }

      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }
}
