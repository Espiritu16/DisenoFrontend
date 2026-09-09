/**
 * Datos semilla de la demo. Todo es ficticio: zonas, vecinos, incidencias y
 * mediciones fueron inventados para esta demostración.
 */
import {
  AlertaServicioResponse,
  CasoResponse,
  NivelAguaResponse,
  ReporteResponse,
  UsuarioResponse,
  ZonaServicioResponse,
} from '../app/core/api/api-models';

const HOY = new Date();

export function fechaRelativa(diasAtras: number, hora = 10, minuto = 15): string {
  const fecha = new Date(HOY);
  fecha.setDate(fecha.getDate() - diasAtras);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha.toISOString();
}

export const ZONAS_SEMILLA: ZonaServicioResponse[] = [
  { id: 1, nombre: 'Villa Esperanza', codigo: 'ZN-01' },
  { id: 2, nombre: 'Los Álamos', codigo: 'ZN-02' },
  { id: 3, nombre: 'Nueva Aurora', codigo: 'ZN-03' },
  { id: 4, nombre: 'El Mirador', codigo: 'ZN-04' },
  { id: 5, nombre: 'San Isidro Alto', codigo: 'ZN-05' },
];

export const USUARIOS_SEMILLA: UsuarioResponse[] = [
  { id: 1, nombre: 'Rosa Delgado', correo: 'admin@aquacomunidad.demo', rol: 'ADMIN', estado: 'ACTIVO' },
  { id: 2, nombre: 'Julio Paredes', correo: 'operador@aquacomunidad.demo', rol: 'OPERADOR', estado: 'ACTIVO' },
  { id: 3, nombre: 'Carmen Ubillús', correo: 'autoridad@aquacomunidad.demo', rol: 'AUTORIDAD', estado: 'ACTIVO' },
  { id: 4, nombre: 'Lucía Ramírez', correo: 'ciudadano@aquacomunidad.demo', rol: 'CIUDADANO', estado: 'ACTIVO' },
  { id: 5, nombre: 'Diego Maldonado', correo: 'diego.maldonado@aquacomunidad.demo', rol: 'OPERADOR', estado: 'ACTIVO' },
  { id: 6, nombre: 'Ana Quispe', correo: 'ana.quispe@aquacomunidad.demo', rol: 'CIUDADANO', estado: 'ACTIVO' },
  { id: 7, nombre: 'Marco Ivanoff', correo: 'marco.ivanoff@aquacomunidad.demo', rol: 'CIUDADANO', estado: 'ACTIVO' },
  { id: 8, nombre: 'Teresa Huamán', correo: 'teresa.huaman@aquacomunidad.demo', rol: 'CIUDADANO', estado: 'INACTIVO' },
];

/** El ciudadano con el que entra el visitante de la demo. */
export const ID_CIUDADANO_DEMO = 4;

interface SemillaReporte {
  tipo: string;
  descripcion: string;
  zona: string;
  direccion: string;
  estado: ReporteResponse['estado'];
  usuarioId: number;
  dias: number;
  lat: number;
  lng: number;
  duplicado?: boolean;
}

const REPORTES_BASE: SemillaReporte[] = [
  { tipo: 'Fuga de agua', descripcion: 'Fuga constante en la vereda frente al parque; el agua corre hacia la pista.', zona: 'Villa Esperanza', direccion: 'Jr. Las Begonias 240', estado: 'RESUELTO', usuarioId: 4, dias: 34, lat: -12.048, lng: -77.031 },
  { tipo: 'Desabastecimiento', descripcion: 'Sin agua desde ayer por la tarde en toda la manzana.', zona: 'Los Álamos', direccion: 'Av. Los Álamos 1180', estado: 'RESUELTO', usuarioId: 6, dias: 30, lat: -12.052, lng: -77.038 },
  { tipo: 'Agua turbia', descripcion: 'El agua sale con color marrón desde temprano.', zona: 'Nueva Aurora', direccion: 'Calle Los Sauces 512', estado: 'RESUELTO', usuarioId: 7, dias: 27, lat: -12.061, lng: -77.044 },
  { tipo: 'Presión baja', descripcion: 'La presión bajó mucho; en el segundo piso ya no llega.', zona: 'El Mirador', direccion: 'Pasaje San Juan 88', estado: 'RESUELTO', usuarioId: 4, dias: 24, lat: -12.058, lng: -77.052 },
  { tipo: 'Rotura de tubería', descripcion: 'Rotura en la esquina; sale agua a presión desde la mañana.', zona: 'Villa Esperanza', direccion: 'Jr. Las Begonias 310', estado: 'RESUELTO', usuarioId: 6, dias: 21, lat: -12.047, lng: -77.033 },
  { tipo: 'Medidor averiado', descripcion: 'El medidor marca consumo aunque la llave general esté cerrada.', zona: 'San Isidro Alto', direccion: 'Av. Central 705', estado: 'RECHAZADO', usuarioId: 7, dias: 19, lat: -12.065, lng: -77.057 },
  { tipo: 'Fuga de agua', descripcion: 'Fuga pequeña en la conexión domiciliaria, gotea sin parar.', zona: 'Los Álamos', direccion: 'Av. Los Álamos 940', estado: 'RESUELTO', usuarioId: 4, dias: 17, lat: -12.053, lng: -77.039 },
  { tipo: 'Desabastecimiento', descripcion: 'Tercer día sin servicio en la parte alta del sector.', zona: 'El Mirador', direccion: 'Calle Los Cedros 15', estado: 'EN_PROCESO', usuarioId: 6, dias: 14, lat: -12.059, lng: -77.055 },
  { tipo: 'Agua turbia', descripcion: 'Agua con sedimento y olor fuerte desde el corte del lunes.', zona: 'Nueva Aurora', direccion: 'Calle Los Sauces 640', estado: 'EN_PROCESO', usuarioId: 7, dias: 12, lat: -12.062, lng: -77.046 },
  { tipo: 'Fuga de agua', descripcion: 'Fuga en la matriz de la avenida; ya se formó un charco grande.', zona: 'Villa Esperanza', direccion: 'Av. Los Próceres 1220', estado: 'EN_PROCESO', usuarioId: 4, dias: 9, lat: -12.046, lng: -77.030 },
  { tipo: 'Fuga de agua', descripcion: 'Sigue la fuga de la avenida, ahora con más caudal.', zona: 'Villa Esperanza', direccion: 'Av. Los Próceres 1224', estado: 'DUPLICADO', usuarioId: 6, dias: 8, lat: -12.046, lng: -77.030, duplicado: true },
  { tipo: 'Presión baja', descripcion: 'Presión muy baja en horas de la mañana.', zona: 'Los Álamos', direccion: 'Jr. Tacna 402', estado: 'ESCALADO', usuarioId: 7, dias: 7, lat: -12.054, lng: -77.041 },
  { tipo: 'Desabastecimiento', descripcion: 'No hay agua desde la madrugada; somos varias familias.', zona: 'San Isidro Alto', direccion: 'Av. Central 330', estado: 'PENDIENTE', usuarioId: 4, dias: 5, lat: -12.066, lng: -77.059 },
  { tipo: 'Rotura de tubería', descripcion: 'Tubería rota tras el trabajo de pavimentación.', zona: 'Nueva Aurora', direccion: 'Calle Las Dalias 77', estado: 'PENDIENTE', usuarioId: 6, dias: 4, lat: -12.063, lng: -77.047 },
  { tipo: 'Agua turbia', descripcion: 'El agua salió turbia después de la reposición del servicio.', zona: 'El Mirador', direccion: 'Pasaje San Juan 120', estado: 'PENDIENTE', usuarioId: 7, dias: 3, lat: -12.057, lng: -77.053 },
  { tipo: 'Fuga de agua', descripcion: 'Fuga en la vereda, junto al poste de luz.', zona: 'Los Álamos', direccion: 'Av. Los Álamos 1310', estado: 'PENDIENTE', usuarioId: 4, dias: 2, lat: -12.051, lng: -77.037 },
  { tipo: 'Presión baja', descripcion: 'Desde el mediodía la presión es casi nula.', zona: 'Villa Esperanza', direccion: 'Jr. Las Begonias 88', estado: 'PENDIENTE', usuarioId: 6, dias: 1, lat: -12.049, lng: -77.032 },
  { tipo: 'Desabastecimiento', descripcion: 'Sin agua desde esta mañana, sin aviso previo.', zona: 'San Isidro Alto', direccion: 'Calle Union 210', estado: 'PENDIENTE', usuarioId: 4, dias: 0, lat: -12.067, lng: -77.060 },
];

export const REPORTES_SEMILLA: ReporteResponse[] = REPORTES_BASE.map((r, i) => ({
  id: i + 1,
  usuarioId: r.usuarioId,
  tipo: r.tipo,
  descripcion: r.descripcion,
  fotoUrl: '',
  fotoUrls: [],
  lat: r.lat,
  lng: r.lng,
  direccion: r.direccion,
  zona: r.zona,
  posibleDuplicado: Boolean(r.duplicado),
  estado: r.estado,
  fechaCreacion: fechaRelativa(r.dias, 8 + (i % 10)),
  fechaActualizacion: fechaRelativa(Math.max(0, r.dias - 1), 12),
}));

interface SemillaCaso {
  reporteIdx: number;
  responsableId: number;
  prioridad: CasoResponse['prioridad'];
  estado: CasoResponse['estado'];
  observaciones: string;
  diasAsignacion: number;
  diasCierre?: number;
}

const CASOS_BASE: SemillaCaso[] = [
  { reporteIdx: 0, responsableId: 2, prioridad: 'ALTA', estado: 'RESUELTO', observaciones: 'Se reemplazó el tramo dañado y se repuso la vereda.', diasAsignacion: 33, diasCierre: 31 },
  { reporteIdx: 1, responsableId: 5, prioridad: 'ALTA', estado: 'RESUELTO', observaciones: 'Se restableció el servicio tras purgar la red.', diasAsignacion: 29, diasCierre: 28 },
  { reporteIdx: 2, responsableId: 2, prioridad: 'MEDIA', estado: 'RESUELTO', observaciones: 'Se realizó limpieza del reservorio de la zona.', diasAsignacion: 26, diasCierre: 24 },
  { reporteIdx: 3, responsableId: 5, prioridad: 'MEDIA', estado: 'RESUELTO', observaciones: 'Se reguló la válvula reductora del sector.', diasAsignacion: 23, diasCierre: 22 },
  { reporteIdx: 4, responsableId: 2, prioridad: 'ALTA', estado: 'RESUELTO', observaciones: 'Reparación de matriz y prueba de estanqueidad conforme.', diasAsignacion: 20, diasCierre: 18 },
  { reporteIdx: 5, responsableId: 5, prioridad: 'BAJA', estado: 'RECHAZADO', observaciones: 'El medidor corresponde a otro suministro; se derivó a comercial.', diasAsignacion: 18, diasCierre: 17 },
  { reporteIdx: 6, responsableId: 2, prioridad: 'BAJA', estado: 'RESUELTO', observaciones: 'Se cambió el empalme de la conexión domiciliaria.', diasAsignacion: 16, diasCierre: 15 },
  { reporteIdx: 7, responsableId: 5, prioridad: 'ALTA', estado: 'EN_PROCESO', observaciones: 'Cisterna programada mientras se repara la impulsión.', diasAsignacion: 13 },
  { reporteIdx: 8, responsableId: 2, prioridad: 'MEDIA', estado: 'EN_PROCESO', observaciones: 'Se tomaron muestras para análisis de turbiedad.', diasAsignacion: 11 },
  { reporteIdx: 9, responsableId: 5, prioridad: 'ALTA', estado: 'EN_PROCESO', observaciones: 'Cuadrilla en sitio; se requiere corte programado.', diasAsignacion: 8 },
  { reporteIdx: 11, responsableId: 2, prioridad: 'MEDIA', estado: 'ESCALADO', observaciones: 'Requiere intervención de la unidad de redes primarias.', diasAsignacion: 6 },
];

export const CASOS_SEMILLA: CasoResponse[] = CASOS_BASE.map((c, i) => {
  const reporte = REPORTES_SEMILLA[c.reporteIdx];
  return {
    id: i + 1,
    reporteId: reporte.id,
    reporteTipo: reporte.tipo,
    reporteZona: reporte.zona,
    reporteDescripcion: reporte.descripcion,
    reporteFechaCreacion: reporte.fechaCreacion,
    responsableId: c.responsableId,
    prioridad: c.prioridad,
    estado: c.estado,
    observaciones: c.observaciones,
    evidenciaCierre: undefined,
    evidenciaCierreUrls: [],
    fechaAsignacion: fechaRelativa(c.diasAsignacion, 9),
    fechaCierre: c.diasCierre != null ? fechaRelativa(c.diasCierre, 16) : undefined,
  };
});

export const ALERTAS_SEMILLA: AlertaServicioResponse[] = [
  {
    id: 1, zona: 'El Mirador', tipo: 'CORTE_NO_PROGRAMADO', titulo: 'Corte por rotura en la impulsión',
    descripcion: 'Servicio suspendido en la parte alta mientras se repara la línea de impulsión.',
    severidad: 'CRITICA', estado: 'ACTIVA', iniciaEn: fechaRelativa(1, 6), finalizaEn: fechaRelativa(-1, 18), creadoEn: fechaRelativa(1, 6),
  },
  {
    id: 2, zona: 'Villa Esperanza', tipo: 'MANTENIMIENTO', titulo: 'Mantenimiento del reservorio R-2',
    descripcion: 'Limpieza y desinfección programada. Puede haber baja presión durante la mañana.',
    severidad: 'MEDIA', estado: 'PROGRAMADA', iniciaEn: fechaRelativa(-2, 8), finalizaEn: fechaRelativa(-2, 14), creadoEn: fechaRelativa(3, 11),
  },
  {
    id: 3, zona: 'Nueva Aurora', tipo: 'RIESGO_DESABASTECIMIENTO', titulo: 'Riesgo de desabastecimiento',
    descripcion: 'El nivel del reservorio está por debajo del 30%. Se recomienda uso responsable.',
    severidad: 'ALTA', estado: 'ACTIVA', iniciaEn: fechaRelativa(0, 7), creadoEn: fechaRelativa(0, 7),
  },
  {
    id: 4, zona: 'Los Álamos', tipo: 'CORTE_PROGRAMADO', titulo: 'Corte programado por empalme',
    descripcion: 'Suspensión temporal para conectar la nueva matriz de la avenida.',
    severidad: 'INFO', estado: 'RESUELTA', iniciaEn: fechaRelativa(9, 8), finalizaEn: fechaRelativa(9, 17), creadoEn: fechaRelativa(11, 10),
  },
  {
    id: 5, zona: undefined, tipo: 'INFORMATIVA', titulo: 'Campaña de uso responsable del agua',
    descripcion: 'Del 1 al 15 se realizarán charlas vecinales sobre consumo responsable.',
    severidad: 'INFO', estado: 'ACTIVA', creadoEn: fechaRelativa(6, 9),
  },
  {
    id: 6, zona: 'San Isidro Alto', tipo: 'CORTE_NO_PROGRAMADO', titulo: 'Falla en el bombeo',
    descripcion: 'Se atendió la falla eléctrica de la estación de bombeo y se repuso el servicio.',
    severidad: 'ALTA', estado: 'CANCELADA', iniciaEn: fechaRelativa(15, 5), finalizaEn: fechaRelativa(15, 12), creadoEn: fechaRelativa(15, 5),
  },
];

export const NIVELES_AGUA_SEMILLA: NivelAguaResponse[] = [
  { infraestructuraId: 1, nombre: 'Reservorio R-1', zona: 'Villa Esperanza', tipo: 'RESERVORIO', nivelPorcentaje: 78, bateriaPorcentaje: 92, senalPorcentaje: 85, estado: 'NORMAL', actualizadoEn: fechaRelativa(0, 14, 5) },
  { infraestructuraId: 2, nombre: 'Reservorio R-2', zona: 'Nueva Aurora', tipo: 'RESERVORIO', nivelPorcentaje: 26, bateriaPorcentaje: 74, senalPorcentaje: 61, estado: 'CRITICO', actualizadoEn: fechaRelativa(0, 14, 2) },
  { infraestructuraId: 3, nombre: 'Tanque elevado T-3', zona: 'El Mirador', tipo: 'TANQUE', nivelPorcentaje: 41, bateriaPorcentaje: 55, senalPorcentaje: 48, estado: 'BAJO', actualizadoEn: fechaRelativa(0, 13, 50) },
  { infraestructuraId: 4, nombre: 'Tanque T-4', zona: 'Los Álamos', tipo: 'TANQUE', nivelPorcentaje: 88, bateriaPorcentaje: 97, senalPorcentaje: 90, estado: 'NORMAL', actualizadoEn: fechaRelativa(0, 14, 8) },
  { infraestructuraId: 5, nombre: 'Matriz principal M-1', zona: 'San Isidro Alto', tipo: 'TUBERIA_PRINCIPAL', estado: 'SIN_DATOS', actualizadoEn: fechaRelativa(2, 9) },
];

/** Respuestas del asistente: la demo no llama a ningún modelo de IA. */
export const RESPUESTAS_CHATBOT: { claves: string[]; respuesta: string; acciones?: { etiqueta: string; ruta: string }[] }[] = [
  {
    claves: ['fuga', 'rotura', 'tuberia', 'tubería'],
    respuesta:
      'Para una fuga o rotura, registra el reporte con la dirección exacta y una foto si puedes. ' +
      'Las fugas en vía pública se atienden con prioridad alta y suelen asignarse a una cuadrilla el mismo día.',
    acciones: [{ etiqueta: 'Reportar incidencia', ruta: '/reportar' }],
  },
  {
    claves: ['corte', 'sin agua', 'desabastecimiento'],
    respuesta:
      'Puedes revisar si tu zona tiene un corte programado o una alerta activa en la sección de estado del servicio. ' +
      'Si no figura ninguna alerta, conviene registrar el reporte para que se atienda.',
    acciones: [
      { etiqueta: 'Ver estado del servicio', ruta: '/estado-servicio' },
      { etiqueta: 'Reportar incidencia', ruta: '/reportar' },
    ],
  },
  {
    claves: ['turbia', 'color', 'olor', 'sedimento'],
    respuesta:
      'Si el agua sale turbia, deja correr el caño unos minutos y evita consumirla mientras tanto. ' +
      'Registra el reporte indicando desde cuándo ocurre: se toman muestras para analizar la turbiedad.',
    acciones: [{ etiqueta: 'Reportar incidencia', ruta: '/reportar' }],
  },
  {
    claves: ['estado', 'mi reporte', 'seguimiento', 'avance'],
    respuesta:
      'En «Mis reportes» puedes ver el estado de cada incidencia que registraste y su trazabilidad completa: ' +
      'cuándo se recibió, cuándo se convirtió en caso y qué observación dejó el operador.',
    acciones: [{ etiqueta: 'Ver mis reportes', ruta: '/mis-reportes' }],
  },
  {
    claves: ['presion', 'presión'],
    respuesta:
      'La baja presión suele deberse a la regulación de una válvula del sector o a demanda alta en horas punta. ' +
      'Si se mantiene varios días, registra el reporte para que se revise la red del sector.',
    acciones: [{ etiqueta: 'Reportar incidencia', ruta: '/reportar' }],
  },
];
