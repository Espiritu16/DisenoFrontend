import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/api/dashboard.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = false;
  error = '';

  kpis = {
    casosActivos: 0,
    reportesNuevos: 0,
    casosEnEspera: 0,
    casosPorAsignar: 0
  };

  actividadSemanal = [
    { dia: 'Lun', valor: 45 },
    { dia: 'Mar', valor: 60 },
    { dia: 'Mié', valor: 75 },
    { dia: 'Jue', valor: 95 },
    { dia: 'Vie', valor: 50 },
    { dia: 'Sáb', valor: 35 },
    { dia: 'Hoy', valor: 55 }
  ];

  // Districts Data
  reportesPorDistrito = [
    { nombre: 'San Borja', cantidad: 124 },
    { nombre: 'Miraflores', cantidad: 98 },
    { nombre: 'Surco', cantidad: 76 },
    { nombre: 'La Molina', cantidad: 45 },
    { nombre: 'San Isidro', cantidad: 32 }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarKpis();
  }

  cargarKpis(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.kpis().subscribe({
      next: (kpi) => {
        this.kpis = {
          casosActivos: kpi.casosAbiertos,
          reportesNuevos: kpi.reportesPendientes,
          casosEnEspera: kpi.reportesEnProceso,
          casosPorAsignar: kpi.reportesPendientes
        };
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = apiErrorMessage(error);
      }
    });
  }
}
