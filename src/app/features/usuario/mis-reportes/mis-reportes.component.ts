import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DetalleTrazabilidadReporte, ReporteResponse } from '../../../core/api/api-models';
import { formatDateTime, reportStatusFromLabel, reportStatusLabel } from '../../../core/api/api-mappers';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ReportesService } from '../../../core/api/reportes.service';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reportes.component.html',
  styleUrl: './mis-reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisReportesComponent implements OnInit {
  @ViewChild('reportList') private reportList?: ElementRef<HTMLElement>;

  statusFilter = 'Todos';
  selected?: ReporteResponse;
  trazabilidad?: DetalleTrazabilidadReporte;
  message = '';
  loading = false;
  reportes: ReporteResponse[] = [];

  constructor(private reportesService: ReportesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.refresh();
  }

  get total(): number { return this.reportes.length; }
  get pendientes(): number { return this.reportes.filter((r) => r.estado === 'PENDIENTE').length; }
  get enProceso(): number { return this.reportes.filter((r) => r.estado === 'EN_PROCESO').length; }
  get resueltos(): number { return this.reportes.filter((r) => r.estado === 'RESUELTO').length; }

  get filtered(): ReporteResponse[] {
    if (!this.reportes || this.reportes.length === 0) {
      return [];
    }

    if (this.statusFilter === 'Todos') {
      return this.reportes;
    }

    const estado = reportStatusFromLabel(this.statusFilter);
    return estado ? this.reportes.filter((r) => r.estado === estado) : this.reportes;
  }

  onFilterChange(): void {
    this.selected = undefined;
    this.trazabilidad = undefined;
    this.resetReportListScroll();
    this.cdr.markForCheck();
  }

  select(r: ReporteResponse): void {
    this.selected = r;
    this.trazabilidad = undefined;
    this.reportesService.trazabilidad(r.id).subscribe({
      next: (data) => {
        this.trazabilidad = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.trazabilidad = undefined;
        this.cdr.markForCheck();
      }
    });
  }

  refresh(): void {
    this.loading = true;
    this.message = '';
    this.reportesService.listarMisReportes().subscribe({
      next: (reportes) => {
        this.reportes = reportes;
        this.statusFilter = 'Todos';
        this.selected = undefined;
        this.trazabilidad = undefined;
        this.loading = false;
        this.cdr.markForCheck();
        this.resetReportListScroll();
        if (reportes.length > 0) {
          this.select(reportes[0]);
        }
      },
      error: (error: unknown) => {
        this.loading = false;
        this.message = apiErrorMessage(error);
        this.cdr.markForCheck();
      }
    });
  }

  statusLabel = reportStatusLabel;
  formatDate = formatDateTime;
  trackById(_: number, r: ReporteResponse): number { return r.id; }

  private resetReportListScroll(): void {
    queueMicrotask(() => {
      this.reportList?.nativeElement.scrollTo({ top: 0, left: 0 });
    });
  }
}
