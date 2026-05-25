import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiRole, AuthSessionResponse, UsuarioResponse } from './api-models';

export interface StoredSession extends AuthSessionResponse {}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'aquacomunidad.session';
  private readonly apiBase = environment.apiBaseUrl;
  readonly session = signal<StoredSession | null>(this.readSession());

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  get role(): ApiRole | null {
    return this.session()?.rol ?? null;
  }

  get userId(): number | null {
    return this.session()?.userId ?? null;
  }

  login(correo: string, password: string): Observable<StoredSession> {
    return this.http.post<ApiResponse<AuthSessionResponse>>(`${this.apiBase}/auth/login`, { correo, password }).pipe(
      map((res) => res.data),
      tap((session) => this.storeSession(session))
    );
  }

  register(nombre: string, correo: string, password: string): Observable<UsuarioResponse> {
    return this.http.post<ApiResponse<UsuarioResponse>>(`${this.apiBase}/auth/register`, { nombre, correo, password }).pipe(
      map((res) => res.data)
    );
  }

  requestRecoveryCode(correo: string): Observable<string> {
    return this.http.post<ApiResponse<{ mensaje: string }>>(`${this.apiBase}/auth/recuperacion/solicitar-codigo`, { correo }).pipe(
      map((res) => res.data.mensaje || res.message)
    );
  }

  confirmRecoveryCode(correo: string, codigo: string): Observable<string> {
    return this.http.post<ApiResponse<{ tokenRecuperacion: string }>>(`${this.apiBase}/auth/recuperacion/confirmar-codigo`, { correo, codigo }).pipe(
      map((res) => res.data.tokenRecuperacion)
    );
  }

  resetPassword(correo: string, tokenRecuperacion: string, nuevaContrasena: string, confirmarContrasena: string): Observable<string> {
    return this.http.post<ApiResponse<{ mensaje: string }>>(`${this.apiBase}/auth/recuperacion/restablecer-contrasena`, {
      correo,
      tokenRecuperacion,
      nuevaContrasena,
      confirmarContrasena
    }).pipe(map((res) => res.data.mensaje || res.message));
  }

  logout(): void {
    const refreshToken = this.session()?.refreshToken;
    this.clearSession();
    if (refreshToken) {
      this.http.post(`${this.apiBase}/auth/cerrarSesion`, { refreshToken }).subscribe({ error: () => undefined });
    }
    void this.router.navigateByUrl('/inicio');
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
  }

  private storeSession(session: StoredSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.session.set(session);
  }

  private readSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as StoredSession : null;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
