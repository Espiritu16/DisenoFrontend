import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/usuario/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'estado-servicio',
        loadComponent: () => import('./features/usuario/estado-servicio/estado-servicio.component').then((m) => m.EstadoServicioComponent)
      },
      {
        path: 'mis-reportes',
        loadComponent: () => import('./features/usuario/mis-reportes/mis-reportes.component').then((m) => m.MisReportesComponent)
      },
      {
        path: 'reportar',
        loadComponent: () => import('./features/usuario/reportar-incidencia/reportar-incidencia.component').then((m) => m.ReportarIncidenciaComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/usuario/contacto/contacto.component').then((m) => m.ContactoComponent)
      }
    ]
  },
  {
    path: 'administrador',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/administrador/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'atencion-casos', loadComponent: () => import('./features/administrador/atencion-casos/atencion-casos.component').then((m) => m.AtencionCasosComponent) },
      { path: 'reportes', loadComponent: () => import('./features/administrador/reportes-ciudadanos/reportes-ciudadanos.component').then((m) => m.ReportesCiudadanosComponent) },
      { path: 'reportar-incidencia', loadComponent: () => import('./features/usuario/reportar-incidencia/reportar-incidencia.component').then((m) => m.ReportarIncidenciaComponent) },
      { path: 'gestion-usuarios', loadComponent: () => import('./features/administrador/gestion-usuarios/gestion-usuarios.component').then((m) => m.GestionUsuariosComponent) },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
