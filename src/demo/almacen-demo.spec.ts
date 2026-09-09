import { beforeEach, describe, expect, it } from 'vitest';
import { AlmacenDemo } from './almacen-demo';

describe('AlmacenDemo', () => {
  let almacen: AlmacenDemo;

  beforeEach(() => {
    almacen = new AlmacenDemo();
  });

  describe('autenticación', () => {
    it('acepta una cuenta de demo y devuelve su rol', () => {
      expect(almacen.login('admin@aquacomunidad.demo', 'demo1234').rol).toBe('ADMIN');
    });

    it('ignora mayúsculas y espacios en el correo', () => {
      expect(almacen.login('  OPERADOR@AquaComunidad.Demo ', 'demo1234').rol).toBe('OPERADOR');
    });

    it('rechaza credenciales inexistentes', () => {
      expect(() => almacen.login('nadie@ejemplo.com', 'x')).toThrowError(/credenciales/i);
    });

    it('al entrar cambia de quién son «mis reportes»', () => {
      almacen.login('ciudadano@aquacomunidad.demo', 'demo1234');
      const mios = almacen.listarMisReportes();

      expect(mios.length).toBeGreaterThan(0);
      expect(mios.every((r) => r.usuarioId === almacen.usuarioSesion)).toBe(true);
    });

    it('no permite registrar dos veces el mismo correo', () => {
      expect(() => almacen.registrar('Otro', 'admin@aquacomunidad.demo')).toThrowError(/correo/i);
    });
  });

  describe('reportes', () => {
    it('lista del más reciente al más antiguo', () => {
      const fechas = almacen.listarReportes().map((r) => new Date(r.fechaCreacion).getTime());
      expect([...fechas].sort((a, b) => b - a)).toEqual(fechas);
    });

    it('filtra por estado y por zona', () => {
      const pendientes = almacen.listarReportes({ estado: 'PENDIENTE' });
      expect(pendientes.every((r) => r.estado === 'PENDIENTE')).toBe(true);

      const zona = almacen.listarReportes({ zona: 'Villa Esperanza' });
      expect(zona.length).toBeGreaterThan(0);
      expect(zona.every((r) => r.zona === 'Villa Esperanza')).toBe(true);
    });

    it('crea un reporte pendiente a nombre de quien tiene la sesión', () => {
      almacen.login('ciudadano@aquacomunidad.demo', 'demo1234');
      const creado = almacen.crearReporte({
        tipo: 'Fuga de agua',
        descripcion: 'Fuga en la esquina del colegio.',
        fotoUrl: '',
        lat: -12.05,
        lng: -77.04,
        direccion: 'Av. Siempre Viva 100',
        zona: 'Los Álamos',
      });

      expect(creado.estado).toBe('PENDIENTE');
      expect(creado.usuarioId).toBe(almacen.usuarioSesion);
      expect(almacen.listarMisReportes()[0].id).toBe(creado.id);
    });

    it('marca como posible duplicado un reporte igual y reciente de la misma zona', () => {
      const base = {
        tipo: 'Rotura de tubería',
        descripcion: 'Rotura en la vía.',
        fotoUrl: '',
        lat: -12.05,
        lng: -77.04,
        direccion: 'Calle 1',
        zona: 'Nueva Aurora',
      };
      // El reporte semilla de esa zona tiene 4 días y la ventana de duplicados es de 3,
      // así que el primero entra limpio y el segundo sí queda marcado.
      const primero = almacen.crearReporte(base);
      const segundo = almacen.crearReporte({ ...base, direccion: 'Calle 2' });

      expect(primero.posibleDuplicado).toBe(false);
      expect(segundo.posibleDuplicado).toBe(true);
    });

    it('exige tipo y descripción', () => {
      expect(() =>
        almacen.crearReporte({ tipo: '', descripcion: '', fotoUrl: '', lat: 0, lng: 0, direccion: '', zona: '' })
      ).toThrowError(/obligatorio/i);
    });
  });

  describe('casos', () => {
    it('asignar un caso pone el reporte en proceso', () => {
      const pendiente = almacen.listarReportes({ estado: 'PENDIENTE' })[0];

      const caso = almacen.crearCaso(pendiente.id, 2, 'ALTA');

      expect(caso.estado).toBe('EN_PROCESO');
      expect(almacen.listarReportes().find((r) => r.id === pendiente.id)!.estado).toBe('EN_PROCESO');
    });

    it('no permite dos casos para el mismo reporte', () => {
      const pendiente = almacen.listarReportes({ estado: 'PENDIENTE' })[0];
      almacen.crearCaso(pendiente.id, 2, 'MEDIA');

      expect(() => almacen.crearCaso(pendiente.id, 2, 'MEDIA')).toThrowError(/ya tiene un caso/i);
    });

    it('resolver el caso marca el reporte como resuelto y registra el cierre', () => {
      const pendiente = almacen.listarReportes({ estado: 'PENDIENTE' })[0];
      const caso = almacen.crearCaso(pendiente.id, 2, 'ALTA');

      const cerrado = almacen.actualizarEstadoCaso(caso.id, 'RESUELTO', 'Se reparó la conexión.');

      expect(cerrado.fechaCierre).toBeTruthy();
      expect(almacen.listarReportes().find((r) => r.id === pendiente.id)!.estado).toBe('RESUELTO');
    });

    it('no permite volver a cerrar un caso ya cerrado', () => {
      const pendiente = almacen.listarReportes({ estado: 'PENDIENTE' })[0];
      const caso = almacen.crearCaso(pendiente.id, 2, 'ALTA');
      almacen.actualizarEstadoCaso(caso.id, 'RESUELTO', 'Listo.');

      expect(() => almacen.actualizarEstadoCaso(caso.id, 'RECHAZADO', 'otra vez')).toThrowError(/cerrado/i);
    });

    it('la trazabilidad enlaza el reporte con su caso', () => {
      const pendiente = almacen.listarReportes({ estado: 'PENDIENTE' })[0];
      const caso = almacen.crearCaso(pendiente.id, 2, 'MEDIA');

      const traza = almacen.trazabilidad(pendiente.id);

      expect(traza.casoId).toBe(caso.id);
      expect(traza.historialReporte.length).toBeGreaterThanOrEqual(2);
      expect(traza.historialCaso.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('estado del servicio', () => {
    it('filtra alertas por estado', () => {
      const activas = almacen.listarAlertas({ estado: 'ACTIVA' });
      expect(activas.length).toBeGreaterThan(0);
      expect(activas.every((a) => a.estado === 'ACTIVA')).toBe(true);
    });

    it('crea una alerta asociada a la zona indicada', () => {
      const alerta = almacen.crearAlerta({
        zonaId: 1,
        tipo: 'MANTENIMIENTO',
        titulo: 'Mantenimiento de válvulas',
        descripcion: 'Trabajos programados.',
        severidad: 'MEDIA',
      });

      expect(alerta.zona).toBe('Villa Esperanza');
      expect(almacen.listarAlertas()[0].id).toBe(alerta.id);
    });

    it('exige un título', () => {
      expect(() =>
        almacen.crearAlerta({ tipo: 'INFORMATIVA', titulo: '  ', descripcion: 'x' })
      ).toThrowError(/título/i);
    });
  });

  describe('indicadores del tablero', () => {
    it('los reportes por estado suman el total', () => {
      const kpi = almacen.obtenerKpis();
      const suma = kpi.reportesPorEstado.reduce((acc, e) => acc + e.cantidad, 0);

      expect(suma).toBe(kpi.totalReportes);
    });

    it('reacciona de inmediato a un reporte nuevo', () => {
      const antes = almacen.obtenerKpis().reportesPendientes;
      almacen.crearReporte({
        tipo: 'Presión baja',
        descripcion: 'Sin presión.',
        fotoUrl: '',
        lat: 0,
        lng: 0,
        direccion: 'x',
        zona: 'El Mirador',
      });

      expect(almacen.obtenerKpis().reportesPendientes).toBe(antes + 1);
    });

    it('entrega siete días de actividad semanal', () => {
      expect(almacen.obtenerKpis().actividadSemanal).toHaveLength(7);
    });

    it('calcula un promedio de resolución positivo a partir de los casos cerrados', () => {
      expect(almacen.obtenerKpis().promedioHorasResolucion).toBeGreaterThan(0);
    });

    it('recomienda priorizar la zona con más reportes abiertos', () => {
      expect(almacen.obtenerKpis().recomendacionAutomatica).toMatch(/priorizar|normalidad/i);
    });
  });

  describe('asistente', () => {
    it('responde según el tema consultado y sugiere una acción', () => {
      const respuesta = almacen.responderChat({ mensaje: '¿Qué hago si hay una fuga?', historial: [] });

      expect(respuesta.iaDisponible).toBe(false);
      expect(respuesta.respuesta).toMatch(/fuga/i);
      expect(respuesta.acciones.length).toBeGreaterThan(0);
    });

    it('ante un tema desconocido explica que es una demostración', () => {
      const respuesta = almacen.responderChat({ mensaje: 'háblame de astronomía', historial: [] });
      expect(respuesta.respuesta).toMatch(/demostraci/i);
    });

    it('guarda la conversación para consultarla después', () => {
      almacen.responderChat({ mensaje: 'no tengo agua', historial: [] });
      const conversaciones = almacen.listarConversaciones();

      expect(conversaciones.length).toBe(1);
      expect(almacen.historialConversacion(conversaciones[0].fechaConversacion).mensajes.length).toBe(2);
    });
  });

  it('reiniciar deja el almacén como al principio', () => {
    const totalInicial = almacen.listarReportes().length;
    almacen.crearReporte({
      tipo: 'Fuga de agua',
      descripcion: 'x',
      fotoUrl: '',
      lat: 0,
      lng: 0,
      direccion: 'x',
      zona: 'Los Álamos',
    });
    almacen.reiniciar();

    expect(almacen.listarReportes().length).toBe(totalInicial);
  });
});

describe('AlmacenDemo · compatibilidad con el tablero', () => {
  it('usa las abreviaturas de mes que el tablero espera', () => {
    const almacen = new AlmacenDemo();
    const meses = almacen.obtenerKpis().reportesPorMes.map((m) => m.mes);
    const validas = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    expect(meses.every((m) => validas.includes(m))).toBe(true);
  });

  it('el mes en curso aparece en la serie de reportes por mes', () => {
    const almacen = new AlmacenDemo();
    const validas = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = validas[new Date().getMonth()];

    expect(almacen.obtenerKpis().reportesPorMes.map((m) => m.mes)).toContain(mesActual);
  });
});
