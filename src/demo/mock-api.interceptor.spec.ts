import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiResponse, AuthSessionResponse, ReporteResponse, TableroKpi } from '../app/core/api/api-models';
import { almacenDemo } from './almacen-demo';
import { mockApiInterceptor } from './mock-api.interceptor';
import { environment } from '../environments/environment';

const BASE = environment.apiBaseUrl;

/** `next` que falla el test si se le llama: nada debe salir a la red en la demo. */
function nextProhibido(): Observable<never> {
  return throwError(() => new Error('La petición salió a la red en lugar de ser interceptada'));
}

function ejecutar<T>(request: HttpRequest<unknown>): Promise<HttpResponse<T>> {
  return firstValueFrom(mockApiInterceptor(request, nextProhibido) as Observable<HttpResponse<T>>);
}

describe('mockApiInterceptor', () => {
  beforeEach(() => {
    almacenDemo.reiniciar();
  });

  it('autentica y responde dentro del sobre ApiResponse', async () => {
    const respuesta = await ejecutar<ApiResponse<AuthSessionResponse>>(
      new HttpRequest('POST', `${BASE}/auth/login`, {
        correo: 'admin@aquacomunidad.demo',
        password: 'demo1234',
      })
    );

    expect(respuesta.body?.success).toBe(true);
    expect(respuesta.body?.data.rol).toBe('ADMIN');
  });

  it('devuelve 401 ante credenciales inválidas', async () => {
    const peticion = ejecutar(
      new HttpRequest('POST', `${BASE}/auth/login`, { correo: 'x@y.z', password: 'x' })
    );
    await expect(peticion).rejects.toMatchObject({ status: 401 });
  });

  it('lista los reportes sin tocar la red', async () => {
    const respuesta = await ejecutar<ApiResponse<ReporteResponse[]>>(
      new HttpRequest('GET', `${BASE}/reportes`)
    );

    expect(respuesta.status).toBe(200);
    expect(respuesta.body?.data.length).toBeGreaterThan(0);
  });

  it('traslada los filtros de la consulta al almacén', async () => {
    const request = new HttpRequest('GET', `${BASE}/reportes`, {
      params: new HttpRequest('GET', '/x').params.set('estado', 'PENDIENTE'),
    });
    const respuesta = await ejecutar<ApiResponse<ReporteResponse[]>>(request);

    expect(respuesta.body?.data.every((r) => r.estado === 'PENDIENTE')).toBe(true);
  });

  it('resuelve los indicadores del tablero', async () => {
    const respuesta = await ejecutar<ApiResponse<TableroKpi>>(new HttpRequest('GET', `${BASE}/dashboard/kpis`));

    expect(respuesta.body?.data.totalReportes).toBeGreaterThan(0);
    expect(respuesta.body?.data.nivelesAgua.length).toBeGreaterThan(0);
  });

  it('entrega la exportación como archivo, sin el sobre', async () => {
    const respuesta = await ejecutar<Blob>(new HttpRequest('GET', `${BASE}/dashboard/exportar-pdf`));
    expect(respuesta.body).toBeInstanceOf(Blob);
  });

  it('crea un caso y deja el reporte en proceso', async () => {
    const pendientes = almacenDemo.listarReportes({ estado: 'PENDIENTE' });
    const objetivo = pendientes[0];

    await ejecutar(
      new HttpRequest('POST', `${BASE}/casos`, {
        reporteId: objetivo.id,
        responsableId: 2,
        prioridad: 'ALTA',
      })
    );

    expect(almacenDemo.listarReportes().find((r) => r.id === objetivo.id)!.estado).toBe('EN_PROCESO');
  });

  it('propaga como error HTTP las reglas del almacén', async () => {
    const pendiente = almacenDemo.listarReportes({ estado: 'PENDIENTE' })[0];
    almacenDemo.crearCaso(pendiente.id, 2, 'ALTA');

    const peticion = ejecutar(
      new HttpRequest('POST', `${BASE}/casos`, { reporteId: pendiente.id, responsableId: 2, prioridad: 'ALTA' })
    );

    await expect(peticion).rejects.toMatchObject({ status: 409 });
  });

  it('devuelve 404 en una ruta no cubierta, sin salir a la red', async () => {
    const peticion = ejecutar(new HttpRequest('GET', `${BASE}/ruta/inexistente`));

    await expect(peticion).rejects.toBeInstanceOf(HttpErrorResponse);
    await expect(peticion).rejects.toMatchObject({ status: 404 });
  });
});
