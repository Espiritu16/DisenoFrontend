# AquaComunidad Frontend

Frontend Angular de AquaComunidad para ciudadanos y personal operativo. Permite registrar incidencias de agua, consultar reportes, usar el asistente ciudadano y administrar reportes, casos y usuarios.

## Stack

| Tecnologia | Uso |
|---|---|
| Angular 21 | Framework de aplicacion |
| TypeScript 5.9 | Lenguaje principal |
| Angular Router | Navegacion publica y administrativa |
| Angular Forms | Formularios de autenticacion, reportes y filtros |
| RxJS | Flujo reactivo de datos HTTP/UI |
| Leaflet | Mapa para ubicacion de incidencias |
| Tailwind/PostCSS | Tooling de estilos disponible |
| Vitest + JSDOM | Pruebas unitarias |
| pnpm 10.12.4 | Gestor de paquetes |
| Nginx | Runtime Docker de produccion |

## Estructura

```text
src/app/
├── core/
│   ├── api/             # Cliente HTTP y servicios hacia backend
│   ├── guards/          # Proteccion de rutas administrativas
│   ├── models/          # Tipos compartidos
│   └── services/        # Servicios transversales
├── features/
│   ├── administrador/
│   │   ├── dashboard/
│   │   ├── atencion-casos/
│   │   ├── reportes-ciudadanos/
│   │   └── gestion-usuarios/
│   ├── usuario/
│   │   ├── inicio/
│   │   ├── reportar/
│   │   ├── reportar-incidencia/
│   │   ├── mis-reportes/
│   │   ├── estado-servicio/
│   │   └── contacto/
│   ├── login/
│   └── not-found/
├── layouts/
│   ├── auth-layout/
│   └── dashboard-layout/
└── shared/
    ├── auth-modal/
    ├── chatbot/
    ├── notifications/
    └── public/
        ├── aqua-header/
        ├── aqua-mobile-nav/
        ├── aqua-footer/
        └── aqua-logo/
```

## Rutas principales

| Ruta | Descripcion |
|---|---|
| `/inicio` | Inicio publico, autenticacion modal y acceso ciudadano |
| `/reportar` | Reporte ciudadano publico |
| `/mis-reportes` | Reportes del ciudadano autenticado |
| `/contacto` | Canales de contacto |
| `/administrador/dashboard` | KPIs del panel administrativo |
| `/administrador/atencion-casos` | Gestion operativa de casos |
| `/administrador/reportes` | Revision de reportes ciudadanos |
| `/administrador/reportar-incidencia` | Registro interno de incidencias |
| `/administrador/gestion-usuarios` | Administracion de usuarios |

## Requisitos

- Node.js 24 recomendado para igualar el `Dockerfile`
- Corepack habilitado
- pnpm 10.12.4

Activar pnpm si hace falta:

```bash
corepack enable
corepack prepare pnpm@10.12.4 --activate
```

## Instalacion

```bash
pnpm install
```

## Desarrollo local

```bash
pnpm start
```

La aplicacion queda en:

```text
http://localhost:4200
```

El comando local usa `proxy.conf.json`:

```text
/api     -> http://localhost:8080
/uploads -> http://localhost:8080
```

Por eso, en local el backend debe estar corriendo en `http://localhost:8080`.

## Build

```bash
pnpm build
```

Salida de produccion:

```text
dist/diseno-frontend-ng/browser
```

## Pruebas

```bash
pnpm test
```

Prueba puntual de un componente:

```bash
pnpm ng test --watch=false --include=src/app/shared/chatbot/chatbot-widget.component.spec.ts
```

## Configuracion de API

Los environments usan rutas relativas:

```ts
apiBaseUrl: '/api/v1'
```

Esto permite que el frontend funcione en distintos entornos sin recompilar URLs absolutas:

| Entorno | Resolucion de `/api` |
|---|---|
| Local | `proxy.conf.json` redirige a `localhost:8080` |
| VPS Docker | `nginx.conf` redirige a `backend:8080` |
| Vercel | `vercel.json` redirige a Render |

`/uploads` tambien se proxya:

| Entorno | Resolucion de `/uploads` |
|---|---|
| Local | Backend local |
| VPS Docker | Backend del compose |
| Vercel | `https://upload-aquacomunidad.proyectoutp.com/uploads` |

## Docker

Construir imagen:

```bash
docker build -t aquacomunidad-frontend .
```

Ejecutar contenedor:

```bash
docker run --rm -p 8096:80 aquacomunidad-frontend
```

El `Dockerfile` compila con pnpm y sirve el build con Nginx.

## Produccion en VPS

En el VPS se despliega junto al backend en:

```text
/opt/proyectos/aquacomunidad/
├── backend/
├── frontend/
├── uploads/
├── .env
└── docker-compose.yml
```

El contenedor frontend publica Nginx en puerto interno `80`; el compose lo expone en `127.0.0.1:8096` y Nginx del VPS sirve HTTPS para:

```text
https://aquacomunidad.proyectoutp.com
```

Flujo recomendado:

```bash
cd /opt/proyectos/aquacomunidad/frontend
git checkout dev
git pull --ff-only origin dev

cd /opt/proyectos/aquacomunidad
docker compose up -d --build frontend
```

Validacion rapida:

```bash
curl -I https://aquacomunidad.proyectoutp.com/inicio
```

## Produccion en Vercel

Configuracion usada:

| Campo | Valor |
|---|---|
| Framework | Angular |
| Install command | `pnpm install` |
| Build command | `pnpm build` |
| Output directory | `dist/diseno-frontend-ng/browser` |

`vercel.json` contiene rewrites para:

- `/api/:path*` hacia el backend de Render.
- `/uploads/:path*` hacia el dominio publico de uploads en el VPS.

## Comandos utiles

```bash
pnpm ng generate component nombre-componente
pnpm ng --help
```

## Notas de seguridad

- No colocar URLs secretas, tokens ni credenciales en archivos versionados.
- Mantener las peticiones contra rutas relativas (`/api/v1`) para que Nginx/Vercel resuelvan el destino.
- Validar formularios en frontend, pero considerar al backend como autoridad final.
