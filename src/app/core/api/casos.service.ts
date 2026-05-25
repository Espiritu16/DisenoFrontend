import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCasePriority, ApiCaseStatus, ApiResponse, CasoResponse } from './api-models';

@Injectable({ providedIn: 'root' })
export class CasosService {
  private readonly base = `${environment.apiBaseUrl}/casos`;

  constructor(private http: HttpClient) {}

  listar(estado?: ApiCaseStatus): Observable<CasoResponse[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ApiResponse<CasoResponse[]>>(this.base, { params }).pipe(map((res) => res.data));
  }

  crear(reporteId: number, responsableId: number, prioridad: ApiCasePriority): Observable<CasoResponse> {
    return this.http.post<ApiResponse<CasoResponse>>(this.base, { reporteId, responsableId, prioridad }).pipe(map((res) => res.data));
  }

  actualizarEstado(id: number, estado: ApiCaseStatus, observaciones: string, evidenciaCierre?: string, evidenciaCierreUrls?: string[]): Observable<CasoResponse> {
    return this.http.patch<ApiResponse<CasoResponse>>(`${this.base}/${id}/estado`, {
      estado,
      observaciones,
      evidenciaCierre,
      evidenciaCierreUrls
    }).pipe(map((res) => res.data));
  }
}
