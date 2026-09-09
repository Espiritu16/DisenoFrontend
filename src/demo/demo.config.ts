/**
 * Configuración de la demo pública de AquaComunidad.
 *
 * Esta carpeta sólo existe en la rama `demo`: permite recorrer el sistema sin la
 * API de Spring Boot. Todos los datos son ficticios.
 */
import { ApiRole } from '../app/core/api/api-models';

/** Retardo simulado de red, para que los indicadores de carga se vean trabajando. */
export const RETARDO_RED_MS = 220;

export interface CuentaDemo {
  correo: string;
  password: string;
  nombre: string;
  rol: ApiRole;
  descripcion: string;
}

export const CUENTAS_DEMO: readonly CuentaDemo[] = [
  {
    correo: 'ciudadano@aquacomunidad.demo',
    password: 'demo1234',
    nombre: 'Lucía Ramírez',
    rol: 'CIUDADANO',
    descripcion: 'Reporta incidencias y sigue su estado',
  },
  {
    correo: 'admin@aquacomunidad.demo',
    password: 'demo1234',
    nombre: 'Rosa Delgado',
    rol: 'ADMIN',
    descripcion: 'Tablero completo, casos y usuarios',
  },
  {
    correo: 'operador@aquacomunidad.demo',
    password: 'demo1234',
    nombre: 'Julio Paredes',
    rol: 'OPERADOR',
    descripcion: 'Atiende los casos asignados en campo',
  },
  {
    correo: 'autoridad@aquacomunidad.demo',
    password: 'demo1234',
    nombre: 'Carmen Ubillús',
    rol: 'AUTORIDAD',
    descripcion: 'Consulta indicadores y estado del servicio',
  },
];
