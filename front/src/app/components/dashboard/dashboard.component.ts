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
  transportType = 'none'; // Valor inicial que no coincide con ningún tipo de transporte
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
  isLoading = false; // Estado de carga inicial

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    //this.resetStats(); // Reiniciar estadísticas
    //this.loadStats(); // Cargar estadísticas (no traerá datos porque transportType es 'none')
    this.checkDatabaseAndSync(); // Verificar si la base de datos está vacía y sincronizar si es necesario
  }

  checkDatabaseAndSync() {
    this.isLoading = true; // Mostrar spinner de carga
    this.authService.isDatabaseEmpty().subscribe({
      next: (response) => {
        if (response.isEmpty) {
          this.syncData(); // Sincronizar si la base de datos está vacía
        } else {
          this.loadStats(); // Cargar estadísticas si la base de datos no está vacía
        }
        this.isLoading = false; // Ocultar spinner de carga
      },
      error: (err) => {
        console.error('Error verificando la base de datos', err);
        this.isLoading = false; // Ocultar spinner de carga
      }
    });
  }

  loadStats() {
    // logs para ver los filtros enviados
    console.log('Filtros enviados:', {
      startYear: this.startYear,
      endYear: this.endYear,
      startMonth: this.startMonth,
      endMonth: this.endMonth,
      transportType: this.transportType
    });

    if (this.transportType === 'none') {
      this.resetStats(); // Mantener las estadísticas en ceros
      return;
    }

    // Limpiar estadísticas antes de cargar nuevas
    this.resetStats(); // Reiniciar estadísticas

    // Llamar al servicio para obtener estadísticas filtradas
    this.dataService.getStats(
      this.startYear,
      this.endYear,
      this.startMonth,
      this.endMonth,
      this.transportType === '' ? undefined : this.transportType // Enviar undefined si es "Todos"
      ).subscribe({
      next: (stats) => {
        console.log('Estadísticas recibidas:', stats);
        this.stats = stats;
      },
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

    this.resetStats(); // Reiniciar estadísticas
    this.authService.logout();// Cargar estadísticas
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Alternar estado del menú
  }

  resetStats() {
    console.log('Inicializando dashboard...');
    this.stats = {
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
  }
}