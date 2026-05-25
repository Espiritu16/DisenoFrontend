import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    const body = error.error as { message?: string; data?: Record<string, string> } | null;
    if (body?.data && typeof body.data === 'object') {
      const first = Object.values(body.data)[0];
      if (first) return first;
    }
    if (body?.message) return body.message;
    if (error.status === 409) return 'Ya existe un registro con esos datos.';
    if (error.status === 0) return 'No se pudo conectar con el backend.';
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
  }
  return 'Ocurrió un error inesperado.';
}
