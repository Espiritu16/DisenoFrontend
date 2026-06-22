import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaServicioRequest, AlertaServicioResponse, ApiResponse } from './api-models';

@Injectable({ providedIn: 'root' })
export class EstadoServicioService {
  private readonly base = `${environment.apiBaseUrl}/estado-servicio`;

  constructor(private http: HttpClient) {}

  listarAlertas(zona?: string): Observable<AlertaServicioResponse[]> {
    let params = new HttpParams();
    if (zona?.trim()) {
      params = params.set('zona', zona.trim());
    }
    return this.http.get<ApiResponse<AlertaServicioResponse[]>>(`${this.base}/alertas`, { params }).pipe(
      map((res) => res.data)
    );
  }

  crearAlerta(payload: AlertaServicioRequest): Observable<AlertaServicioResponse> {
    return this.http.post<ApiResponse<AlertaServicioResponse>>(`${this.base}/alertas`, payload).pipe(
      map((res) => res.data)
    );
  }
}
