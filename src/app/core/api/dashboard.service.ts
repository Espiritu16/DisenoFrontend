import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, TableroKpi } from './api-models';

export interface DashboardFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  kpis(filtros: DashboardFiltros = {}): Observable<TableroKpi> {
    let params = new HttpParams();
    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get<ApiResponse<TableroKpi>>(`${environment.apiBaseUrl}/dashboard/kpis`, { params })
      .pipe(map((res) => res.data));
  }

  exportarPdf(): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/dashboard/exportar-pdf`, { responseType: 'blob' });
  }
}
