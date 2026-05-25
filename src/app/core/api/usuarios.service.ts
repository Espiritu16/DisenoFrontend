import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiRole, ApiUserStatus, UsuarioResponse } from './api-models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly base = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(this.base).pipe(map((res) => res.data));
  }

  crear(nombre: string, correo: string, password: string, rol: ApiRole): Observable<UsuarioResponse> {
    return this.http.post<ApiResponse<UsuarioResponse>>(this.base, { nombre, correo, password, rol }).pipe(map((res) => res.data));
  }

  actualizarRolEstado(id: number, rol: ApiRole, estado: ApiUserStatus): Observable<UsuarioResponse> {
    return this.http.patch<ApiResponse<UsuarioResponse>>(`${this.base}/${id}/rol-estado`, { rol, estado }).pipe(map((res) => res.data));
  }
}
