import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Stats } from '../../interfaces/stats.interface';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  startYear?: number;
  endYear?: number;
  startMonth?: number;
  endMonth?: number;
  transportType = '';
  transportTypes: string[] = [
    'Tren Eléctrico',
    'Trolebús',
    'Macrobús Servicio Troncal',
    'Macrobús Servicio Alimentador',
    'Sistema Integral del Tren Ligero',
    'Mi Transporte Eléctrico',
    'Mi Macro Periférico Troncal',
    'Mi Macro Periférico Alimentador',
    'MI Macro Periférico Alimentador'
  ];
  stats: Stats = {
    totalRevenue: 0,
    totalPassengers: 0,
    totalKilometers: 0,
    totalServiceLength: 0,
    totalUnits: 0,
    totalLines: 0,
    totalWeekdayBuses: 0,
    totalWeekendBuses: 0,
    totalPaidPassengers: 0,
    totalCourtesyPassengers: 0,
    totalDiscountedPassengers: 0,
    totalRoutes: 0,
  };

  isSyncing = false; // Estado de sincronización
  syncMessage = ''; // Mensaje de sincronización
  isMenuOpen = false; // Estado del menú hamburguesa

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dataService.getStats(
      this.startYear,
      this.endYear,
      this.startMonth,
      this.endMonth,
      this.transportType
    ).subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error cargando estadísticas', err)
    });
  }

  syncData() {
    this.isSyncing = true;
    this.syncMessage = 'Sincronizando datos...';

    this.authService.syncData().subscribe({
      next: () => {
        this.syncMessage = 'Sincronización completada';
        this.isSyncing = false;
        this.loadStats(); // Recargar estadísticas después de sincronizar
      },
      error: () => {
        this.syncMessage = 'Error al sincronizar datos';
        this.isSyncing = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Alternar estado del menú
  }
}