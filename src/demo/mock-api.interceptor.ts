/**
 * Interceptor que resuelve toda la API de AquaComunidad contra el almacén en memoria.
 *
 * Se registra el primero en `provideHttpClient`, así que ninguna petición sale a la
 * red: si una ruta no está cubierta responde 404 en lugar de dejarla pasar.
 * El backend real envuelve cada respuesta en `ApiResponse<T>`; aquí se replica.
 */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AlmacenDemo, almacenDemo, ErrorDemo } from './almacen-demo';
import { RETARDO_RED_MS } from './demo.config';
import { environment } from '../environments/environment';

/** `/api/v1/reportes/12/trazabilidad` -> `/reportes/12/trazabilidad`. */
function rutaRelativa(url: string): string {
  const sinConsulta = url.split('?')[0];
  const base = environment.apiBaseUrl;
  const indice = sinConsulta.indexOf(base);
  const ruta = indice >= 0 ? sinConsulta.slice(indice + base.length) : sinConsulta;
  return ruta.startsWith('/') ? ruta : `/${ruta}`;
}

function filtroDesdeParams(params: HttpParams): Record<string, string> {
  const filtro: Record<string, string> = {};
  params.keys().forEach((clave) => {
    const valor = params.get(clave);
    if (valor !== null && valor !== '') filtro[clave] = valor;
  });
  return filtro;
}

/** Envuelve el resultado con el sobre `ApiResponse` que devuelve el backend real. */
function ok<T>(body: T, ruta: string): Observable<HttpEvent<unknown>> {
  const sobre = {
    timestamp: new Date().toISOString(),
    success: true,
    message: 'OK',
    data: body,
    path: ruta,
  };
  return of(new HttpResponse({ status: 200, body: sobre })).pipe(delay(RETARDO_RED_MS));
}

/** Para descargas: el cuerpo va sin sobre. */
function okCrudo<T>(body: T): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(RETARDO_RED_MS));
}

function fallo(status: number, mensaje: string, url: string): Observable<never> {
  const error = new HttpErrorResponse({
    status,
    statusText: mensaje,
    url,
    error: {
      timestamp: new Date().toISOString(),
      success: false,
      message: mensaje,
      data: null,
      path: url,
    },
  });
  return throwError(() => error).pipe(delay(RETARDO_RED_MS)) as Observable<never>;
}

type Manejador = (
  almacen: AlmacenDemo,
  contexto: { request: HttpRequest<unknown>; filtro: Record<string, string>; cuerpo: any; partes: string[] }
) => unknown;

interface Ruta {
  metodo: string;
  patron: RegExp;
  manejar: Manejador;
  /** El PDF y las subidas no viajan dentro del sobre `ApiResponse`. */
  crudo?: boolean;
}

const RUTAS: Ruta[] = [
  // Autenticación
  {
    metodo: 'POST',
    patron: /^\/auth\/login$/,
    manejar: (a, { cuerpo }) => a.login(cuerpo?.correo ?? cuerpo?.email ?? '', cuerpo?.password ?? ''),
  },
  {
    metodo: 'POST',
    patron: /^\/auth\/register$/,
    manejar: (a, { cuerpo }) => {
      const sesion = a.registrar(cuerpo?.nombre ?? 'Vecino', cuerpo?.correo ?? '', cuerpo?.rol ?? 'CIUDADANO');
      // `register` del backend real responde con el usuario creado, no con la sesión.
      return { id: sesion.userId, nombre: sesion.nombre, correo: sesion.correo, rol: sesion.rol, estado: 'ACTIVO' };
    },
  },
  { metodo: 'POST', patron: /^\/auth\/cerrarSesion$/, manejar: () => ({ cerrado: true }) },
  {
    metodo: 'POST',
    patron: /^\/auth\/recuperacion\/solicitar-codigo$/,
    manejar: () => ({ mensaje: 'En la demo no se envían correos. Usa el código 123456.' }),
  },
  {
    metodo: 'POST',
    patron: /^\/auth\/recuperacion\/confirmar-codigo$/,
    manejar: (_a, { cuerpo }) => {
      if (String(cuerpo?.codigo ?? '').trim() !== '123456') {
        throw new ErrorDemo(400, 'Código inválido. En la demo el código es 123456.');
      }
      return { tokenRecuperacion: 'demo-reset-token' };
    },
  },
  {
    metodo: 'POST',
    patron: /^\/auth\/recuperacion\/restablecer-contrasena$/,
    manejar: () => ({ mensaje: 'Contraseña restablecida (simulado en la demo).' }),
  },

  // Tablero
  { metodo: 'GET', patron: /^\/dashboard\/kpis$/, manejar: (a) => a.obtenerKpis() },
  {
    metodo: 'GET',
    patron: /^\/dashboard\/exportar-pdf$/,
    crudo: true,
    manejar: () =>
      new Blob(
        ['Reporte de demostración de AquaComunidad.\nLos datos son ficticios y se generan en el navegador.\n'],
        { type: 'text/plain' }
      ),
  },

  // Reportes
  { metodo: 'GET', patron: /^\/reportes\/mis-reportes$/, manejar: (a) => a.listarMisReportes() },
  {
    metodo: 'GET',
    patron: /^\/reportes\/(\d+)\/trazabilidad$/,
    manejar: (a, { partes }) => a.trazabilidad(Number(partes[0])),
  },
  { metodo: 'GET', patron: /^\/reportes$/, manejar: (a, { filtro }) => a.listarReportes(filtro) },
  { metodo: 'POST', patron: /^\/reportes$/, manejar: (a, { cuerpo }) => a.crearReporte(cuerpo) },

  // Casos
  { metodo: 'GET', patron: /^\/casos$/, manejar: (a, { filtro }) => a.listarCasos(filtro['estado']) },
  {
    metodo: 'POST',
    patron: /^\/casos$/,
    manejar: (a, { cuerpo }) => a.crearCaso(cuerpo?.reporteId, cuerpo?.responsableId, cuerpo?.prioridad),
  },
  {
    metodo: 'PATCH',
    patron: /^\/casos\/(\d+)\/estado$/,
    manejar: (a, { partes, cuerpo }) =>
      a.actualizarEstadoCaso(
        Number(partes[0]),
        cuerpo?.estado,
        cuerpo?.observaciones ?? '',
        cuerpo?.evidenciaCierre,
        cuerpo?.evidenciaCierreUrls
      ),
  },

  // Estado del servicio
  { metodo: 'GET', patron: /^\/estado-servicio\/zonas$/, manejar: (a) => a.listarZonas() },
  { metodo: 'GET', patron: /^\/estado-servicio\/alertas$/, manejar: (a, { filtro }) => a.listarAlertas(filtro) },
  { metodo: 'POST', patron: /^\/estado-servicio\/alertas$/, manejar: (a, { cuerpo }) => a.crearAlerta(cuerpo) },

  // Usuarios
  { metodo: 'GET', patron: /^\/usuarios$/, manejar: (a) => a.listarUsuarios() },
  {
    metodo: 'POST',
    patron: /^\/usuarios$/,
    manejar: (a, { cuerpo }) => a.crearUsuario(cuerpo?.nombre, cuerpo?.correo, cuerpo?.rol),
  },
  {
    metodo: 'PATCH',
    patron: /^\/usuarios\/(\d+)\/rol-estado$/,
    manejar: (a, { partes, cuerpo }) => a.actualizarRolEstado(Number(partes[0]), cuerpo?.rol, cuerpo?.estado),
  },

  // Asistente
  { metodo: 'POST', patron: /^\/chatbot\/mensajes$/, manejar: (a, { cuerpo }) => a.responderChat(cuerpo) },
  { metodo: 'GET', patron: /^\/chatbot\/conversaciones$/, manejar: (a) => a.listarConversaciones() },
  {
    metodo: 'GET',
    patron: /^\/chatbot\/conversaciones\/([\w-]+)\/mensajes$/,
    manejar: (a, { partes }) => a.historialConversacion(partes[0]),
  },

  // Subida de archivos: la demo no almacena imágenes.
  {
    metodo: 'POST',
    patron: /^\/uploads\/([\w-]+)$/,
    manejar: () => ({ url: '', nombreArchivo: 'imagen-demo.png', archivos: [] }),
  },
];

export const mockApiInterceptor: HttpInterceptorFn = (request, _next) => {
  const ruta = rutaRelativa(request.url);
  const coincidencia = RUTAS.find((c) => c.metodo === request.method && c.patron.test(ruta));

  if (!coincidencia) {
    return fallo(404, `La demo no cubre ${request.method} ${ruta}`, request.url);
  }

  try {
    const partes = ruta.match(coincidencia.patron)?.slice(1) ?? [];
    const resultado = coincidencia.manejar(almacenDemo, {
      request,
      filtro: filtroDesdeParams(request.params),
      cuerpo: request.body as any,
      partes,
    });
    return coincidencia.crudo ? okCrudo(resultado) : ok(resultado, ruta);
  } catch (error) {
    if (error instanceof ErrorDemo) {
      return fallo(error.status, error.message, request.url);
    }
    return fallo(500, 'Error inesperado en la demo', request.url);
  }
};
