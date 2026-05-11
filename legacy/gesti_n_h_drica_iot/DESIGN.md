---
name: Gestión Hídrica IoT
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#00a9fd'
  on-secondary-container: '#003a5c'
  tertiary: '#004c36'
  on-tertiary: '#ffffff'
  tertiary-container: '#00664a'
  on-tertiary-container: '#51e9b4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#67fcc6'
  tertiary-fixed-dim: '#44dfab'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  status-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  container-margin: 24px
  gutter: 16px
---

## Marca y Estilo

El sistema de diseño proyecta una identidad de **infraestructura inteligente y bienestar comunitario**. El estilo es una fusión entre el **Minimalismo Moderno** y la estética **Institucional**, transmitiendo la precisión de la tecnología IoT con la calidez de un servicio esencial para las personas.

La interfaz debe sentirse aireada, utilizando el espacio en blanco como una herramienta de jerarquía para reducir la carga cognitiva de los administradores de agua. Se prioriza la claridad funcional, la transparencia de los datos y una estética tecnológica que inspira confianza y orden.

## Colores

La paleta se centra en la temática del agua y la tecnología. 
- **Azul Principal (#0056b3):** Representa la seriedad institucional y la profundidad. Se utiliza para elementos estructurales y acciones primarias.
- **Celeste (#00aaff):** Evoca la fluidez y la modernidad tecnológica. Ideal para acentos y estados activos.
- **Verde Agua (#20c997):** Simboliza la sostenibilidad y la resolución positiva de estados.
- **Neutros:** El gris claro (#f8f9fa) se reserva para fondos de contenedores y secciones, manteniendo el blanco puro (#ffffff) para la superficie principal de trabajo.

## Tipografía

Se utiliza **Inter** por su excepcional legibilidad en pantallas de alta densidad y su carácter técnico pero amable. 
- **Títulos:** Pesos seminegritos (600) y negritos (700) con tracking ligeramente cerrado para un aspecto más arquitectónico.
- **Cuerpo:** Peso regular (400) para lectura prolongada de reportes y datos de consumo.
- **Etiquetas:** Peso medio (500) para asegurar que la información técnica sea rápidamente escaneable.

## Diseño y Espaciado

El sistema utiliza un **Grilla Fluida de 12 columnas** para escritorio y una grilla de **4 columnas para dispositivos móviles**.

- **Ritmo Vertical:** Basado en un módulo de 8px para mantener la consistencia en el espaciado de componentes.
- **Márgenes:** Amplios márgenes laterales en dispositivos móviles (24px) para evitar la sensación de saturación de datos.
- **Contenedores:** El contenido se agrupa en tarjetas modulares que permiten un flujo de información flexible según el rol del usuario (administrador o vecino).

## Elevación y Profundidad

La jerarquía se establece mediante **Capas Tonales** y sombras ambientales muy suaves. 
- **Nivel 0:** Fondo de la aplicación en gris claro (#f8f9fa).
- **Nivel 1:** Tarjetas y contenedores de datos en blanco (#ffffff) con un borde muy fino (1px) en un gris sutil o una sombra con desenfoque amplio y baja opacidad (Alpha 5%).
- **Interacción:** Los elementos interactivos como botones pueden ganar una elevación mayor al pasar el cursor (hover), reforzando la sensación de tangibilidad tecnológica.

## Formas

El sistema adopta un lenguaje de **Bordes Suaves (Rounded)**. Esta decisión suaviza la naturaleza rígida de los datos técnicos, haciendo que la plataforma se sienta "amigable" y accesible para la comunidad.
- **Tarjetas:** Radio de 1rem (16px) para un look moderno.
- **Botones y Badges:** Radio de 0.5rem (8px) para mantener la precisión.
- **Inputs:** Radio de 0.5rem para alineación visual con los botones.

## Componentes

### Botones
- **Primarios:** Fondo Azul (#0056b3), texto blanco. Sin bordes, solo color plano.
- **Secundarios:** Borde Celeste (#00aaff), texto Celeste, fondo transparente.
- **Acción:** Icono lineal a la izquierda para reforzar el contexto.

### Tarjetas (Cards)
Contenedores con bordes suaves que agrupan métricas de consumo o estados de sensores. Deben incluir un título claro y una zona de acción rápida en la parte inferior.

### Badges de Estado
- **Pendiente:** Fondo amarillo suave con texto ámbar oscuro.
- **En Proceso:** Fondo celeste pálido con texto azul.
- **Resuelto:** Fondo verde agua pálido con texto verde oscuro.
Todos con bordes redondeados y tipografía en mayúsculas pequeñas.

### Gráficos
- **Lineales:** Para consumo histórico, con líneas de color Celeste y áreas de relleno con degradados sutiles hacia la transparencia.
- **Circulares:** Para distribución de niveles de tanques, utilizando el Verde Agua para niveles óptimos y Rojo para niveles críticos.

### Iconografía
Iconos de trazo lineal (2px de grosor) con terminales redondeadas. Temas: gotas de agua, ondas de radio (IoT), llaves de paso, y figuras humanas estilizadas para la comunidad.

### Tablas
Diseño minimalista con líneas horizontales finas. Sin bordes verticales. Las filas deben tener un estado de "hover" con cambio de color al gris neutro para facilitar la lectura de datos largos.