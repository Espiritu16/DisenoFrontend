# AquaComunidad Frontend

Aplicación frontend del sistema **AquaComunidad**, orientada a la gestión integral de incidencias hídricas reportadas por la ciudadanía, su atención operativa y la administración de usuarios del panel interno.

## 1. Objetivo del sistema

El sistema tiene como finalidad estandarizar y centralizar el ciclo de atención de incidencias relacionadas con el servicio de agua:

- Registrar reportes ciudadanos con información estructurada.
- Gestionar el seguimiento técnico y operativo de cada caso.
- Proveer visualización de indicadores para soporte de decisiones.
- Administrar usuarios, roles y estados de acceso al sistema.

## 2. Módulos principales

La solución frontend se organiza en módulos funcionales según perfil y contexto de uso:

- **Dashboard (Administrador):** vista de indicadores operativos, actividad reciente y resumen general.
- **Reportes ciudadanos (Administrador):** consulta, filtrado y revisión detallada de incidencias reportadas.
- **Atención de casos (Administrador):** gestión de estado, prioridad, asignación y trazabilidad de casos.
- **Gestión de usuarios (Administrador):** administración de cuentas, roles y estado de usuarios.
- **Flujo público/usuario:** inicio, registro de incidencias, consulta de reportes propios, estado del servicio y contacto.
- **Autenticación:** acceso y control de sesión en el entorno administrativo.

## 3. Estructura del proyecto

### Estructura de paquetes (`src/app`)

```text
src/app/
├── core/
│   ├── models/                  # Tipos e interfaces del dominio
│   └── services/                # Servicios transversales y lógica base
├── features/
│   ├── administrador/
│   │   ├── atencion-casos/      # Gestión operativa de casos
│   │   ├── dashboard/           # Resumen e indicadores del panel
│   │   ├── gestion-usuarios/    # Administración de usuarios
│   │   └── reportes-ciudadanos/ # Gestión y detalle de reportes
│   ├── login/                   # Acceso al sistema
│   ├── not-found/               # Manejo de ruta no encontrada (404)
│   └── usuario/
│       ├── contacto/            # Canal de contacto
│       ├── estado-servicio/     # Estado general del servicio
│       ├── inicio/              # Página de inicio pública
│       ├── mis-reportes/        # Historial de reportes del ciudadano
│       └── reportar-incidencia/ # Registro de nuevas incidencias
├── layouts/
│   ├── auth-layout/             # Layout para autenticación
│   ├── dashboard-layout/        # Layout para panel administrativo
│   └── public-layout/           # Layout para vistas públicas
└── shared/
    ├── auth-modal/              # Modal compartido de autenticación
    └── components/              # Componentes reutilizables
```

### Archivos clave en la raíz

- `angular.json`: configuración del workspace Angular.
- `package.json`: scripts de ejecución, dependencias y metadatos del proyecto.
- `tsconfig*.json`: configuración de compilación TypeScript.
- `public/`: recursos estáticos públicos.
- `src/`: código fuente principal de la aplicación.

## 4. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 |
| Lenguaje | TypeScript 5.9 |
| Interfaz | HTML + CSS (arquitectura por componentes) |
| Enrutamiento | Angular Router |
| Formularios | Angular Forms |
| Programación reactiva | RxJS 7 |
| Mapas | Leaflet |
| Tooling | Angular CLI 21 |
| Pruebas | Vitest + JSDOM |
| Formato de código | Prettier |
| Gestión de paquetes | npm |

## 5. Dependencias principales

### Runtime (`dependencies`)

- `@angular/*`: núcleo del framework, renderizado, routing y formularios.
- `rxjs`: composición reactiva y manejo de asincronía.
- `leaflet`: visualización cartográfica de incidencias.
- `@types/leaflet`: tipado TypeScript para Leaflet.
- `tslib`: utilidades de runtime generadas por TypeScript.

### Desarrollo (`devDependencies`)

- `@angular/cli`, `@angular/build`, `@angular/compiler-cli`: compilación, build y utilidades de desarrollo.
- `typescript`: compilación y validación estática de tipos.
- `vitest`, `jsdom`: ejecución de pruebas unitarias en entorno simulado de navegador.
- `prettier`: normalización de formato de código.

## 6. Instalación y ejecución

### Requisitos mínimos

- **Node.js** 20 o superior
- **npm** 10 o superior (el proyecto está configurado con `npm@11.6.0`)

### Instalación de dependencias

```bash
npm install
```

### Ejecución en entorno de desarrollo

```bash
npm start
```

URL local por defecto: `http://localhost:4200/`

### Compilación del proyecto

```bash
npm run build
```

### Compilación en modo observación

```bash
npm run watch
```

### Ejecución de pruebas

```bash
npm test
```

## 7. Comandos útiles

```bash
# Generar un componente
npx ng generate component nombre-componente

# Consultar ayuda de Angular CLI
npx ng --help
```
