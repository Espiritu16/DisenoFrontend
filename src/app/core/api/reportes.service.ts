import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiReportStatus, ApiResponse, DetalleTrazabilidadReporte, ReporteRequest, ReporteResponse } from './api-models';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly base = `${environment.apiBaseUrl}/reportes`;

  constructor(private http: HttpClient) {}

  crear(payload: ReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ApiResponse<ReporteResponse>>(this.base, payload).pipe(map((res) => res.data));
  }

  listarTodos(filters?: {
    usuarioId?: number;
    estado?: ApiReportStatus;
    tipo?: string;
    zona?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<ReporteResponse[]> {
    let params = new HttpParams();
    if (filters?.usuarioId != null) params = params.set('usuarioId', String(filters.usuarioId));
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.tipo?.trim()) params = params.set('tipo', filters.tipo.trim());
    if (filters?.zona?.trim()) params = params.set('zona', filters.zona.trim());
    if (filters?.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
    return this.http.get<ApiResponse<ReporteResponse[]>>(this.base, { params }).pipe(map((res) => res.data));
  }

  listarMisReportes(): Observable<ReporteResponse[]> {
    return this.http.get<ApiResponse<ReporteResponse[]>>(`${this.base}/mis-reportes`).pipe(map((res) => res.data));
  }

  trazabilidad(id: number): Observable<DetalleTrazabilidadReporte> {
    return this.http.get<ApiResponse<DetalleTrazabilidadReporte>>(`${this.base}/${id}/trazabilidad`).pipe(map((res) => res.data));
  }
}
