import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { adminCanActivateChildGuard, adminCanMatchGuard } from './core/guards/admin-access.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./features/usuario/inicio/inicio.component').then((m) => m.InicioComponent)
  },
  {
    path: 'reportar',
    loadComponent: () => import('./features/usuario/reportar/reportar.component').then((m) => m.ReportarComponent)
  },
  {
    path: 'mis-reportes',
    loadComponent: () => import('./features/usuario/mis-reportes/mis-reportes.component').then((m) => m.MisReportesComponent)
  },
  {
    path: 'estado-servicio',
    loadComponent: () => import('./features/usuario/estado-servicio/estado-servicio.component').then((m) => m.EstadoServicioComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/usuario/contacto/contacto.component').then((m) => m.ContactoComponent)
  },
  {
    path: 'wireframe',
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/wireframe/wireframe-inicio/wireframe-inicio.component').then((m) => m.WireframeInicioComponent)
      },
      {
        path: 'reportar',
        loadComponent: () => import('./features/wireframe/wireframe-reportar/wireframe-reportar.component').then((m) => m.WireframeReportarComponent)
      },
      {
        path: 'mis-reportes',
        loadComponent: () => import('./features/wireframe/wireframe-mis-reportes/wireframe-mis-reportes.component').then((m) => m.WireframeMisReportesComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/wireframe/wireframe-contacto/wireframe-contacto.component').then((m) => m.WireframeContactoComponent)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'administrador',
    component: DashboardLayoutComponent,
    canMatch: [adminCanMatchGuard],
    canActivateChild: [adminCanActivateChildGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/administrador/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'atencion-casos', loadComponent: () => import('./features/administrador/atencion-casos/atencion-casos.component').then((m) => m.AtencionCasosComponent) },
      { path: 'reportes', loadComponent: () => import('./features/administrador/reportes-ciudadanos/reportes-ciudadanos.component').then((m) => m.ReportesCiudadanosComponent) },
      { path: 'estado-servicio', loadComponent: () => import('./features/administrador/estado-servicio-admin/estado-servicio-admin.component').then((m) => m.EstadoServicioAdminComponent) },
      { path: 'reportar-incidencia', loadComponent: () => import('./features/usuario/reportar-incidencia/reportar-incidencia.component').then((m) => m.ReportarIncidenciaComponent) },
      { path: 'gestion-usuarios', loadComponent: () => import('./features/administrador/gestion-usuarios/gestion-usuarios.component').then((m) => m.GestionUsuariosComponent) },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
