import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // KPI Data
  kpis = {
    casosActivos: 142,
    reportesNuevos: 38,
    casosEnEspera: 24,
    casosPorAsignar: 56
  };

  // Chart Data
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

  ngOnInit(): void {
    // Aquí irían las llamadas a servicios si fuera necesario
  }
}
