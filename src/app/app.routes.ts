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
        loadComponent: () => import('./features/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'estado-servicio',
        loadComponent: () => import('./features/estado-servicio/estado-servicio.component').then((m) => m.EstadoServicioComponent)
      },
      {
        path: 'mis-reportes',
        loadComponent: () => import('./features/mis-reportes/mis-reportes.component').then((m) => m.MisReportesComponent)
      },
      {
        path: 'reportar',
        loadComponent: () => import('./features/reportar-incidencia/reportar-incidencia.component').then((m) => m.ReportarIncidenciaComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/contacto/contacto.component').then((m) => m.ContactoComponent)
      }
    ]
  },
  {
    path: 'administrador',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'incidencias', loadComponent: () => import('./features/incidencias/incidencias.component').then((m) => m.IncidenciasComponent) },
      { path: 'reportar-incidencia', loadComponent: () => import('./features/reportar-incidencia/reportar-incidencia.component').then((m) => m.ReportarIncidenciaComponent) },
      { path: 'monitoreo-iot', loadComponent: () => import('./features/monitoreo-iot/monitoreo-iot.component').then((m) => m.MonitoreoIotComponent) },
      { path: 'historial-analitica', loadComponent: () => import('./features/historial-analitica/historial-analitica.component').then((m) => m.HistorialAnaliticaComponent) },
      { path: 'autoridades', loadComponent: () => import('./features/autoridades/autoridades.component').then((m) => m.AutoridadesComponent) }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
