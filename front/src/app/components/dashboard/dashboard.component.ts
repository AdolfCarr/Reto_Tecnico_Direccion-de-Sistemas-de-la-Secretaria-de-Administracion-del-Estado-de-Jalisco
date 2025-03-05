import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Stats } from '../../interfaces/stats.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  lastSyncTime: string | null = null; // Almacena la última fecha y hora de sincronización

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

  // Límites para los filtros
  readonly MIN_YEAR = 1995;
  readonly MAX_YEAR = new Date().getFullYear();
  readonly MIN_MONTH = 1;
  readonly MAX_MONTH = 12;

  // Estado de errores
  isStartYearInvalid = false;
  isEndYearInvalid = false;
  isStartMonthInvalid = false;
  isEndMonthInvalid = false;

  // Toast message
  showToast = false;
  toastMessage = '';

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Recuperar la última fecha de sincronización del localStorage al inicializar el componente
    this.lastSyncTime = localStorage.getItem('lastSyncTime');
  }

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

    // Validar los filtros antes de aplicarlos
    this.isStartYearInvalid = this.startYear !== undefined && (this.startYear < this.MIN_YEAR || this.startYear > this.MAX_YEAR);
    this.isEndYearInvalid = this.endYear !== undefined && (this.endYear < this.MIN_YEAR || this.endYear > this.MAX_YEAR);
    this.isStartMonthInvalid = this.startMonth !== undefined && (this.startMonth < this.MIN_MONTH || this.startMonth > this.MAX_MONTH);
    this.isEndMonthInvalid = this.endMonth !== undefined && (this.endMonth < this.MIN_MONTH || this.endMonth > this.MAX_MONTH);

    if (this.isStartYearInvalid) {
      this.showError(`El año de inicio debe estar entre ${this.MIN_YEAR} y ${this.MAX_YEAR}.`);
      return;
    }

    if (this.isEndYearInvalid) {
      this.showError(`El año de fin debe estar entre ${this.MIN_YEAR} y ${this.MAX_YEAR}.`);
      return;
    }

    if (this.isStartMonthInvalid) {
      this.showError(`El mes de inicio debe estar entre ${this.MIN_MONTH} y ${this.MAX_MONTH}.`);
      return;
    }

    if (this.isEndMonthInvalid) {
      this.showError(`El mes de fin debe estar entre ${this.MIN_MONTH} y ${this.MAX_MONTH}.`);
      return;
    }

    if (this.startYear && this.endYear && this.startYear > this.endYear) {
      this.showError('El año de inicio debe ser menor que el año de fin.');
      return;
    }

    if (this.startYear === this.endYear && this.startMonth && this.endMonth && this.startMonth >= this.endMonth) {
      this.showError('Cuando el año de inicio y fin son iguales, el mes de inicio debe ser menor que el mes de fin.');
      return;
    }

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
      error: (err) => {
        console.error('Error cargando estadísticas', err);
        if (err.status === 401) { // Si el error es 401 (Unauthorized)
          console.error('Error session expired!!', err);
          this.toastr.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Error', {
            timeOut: 5000, // Duración del toast
            positionClass: 'toast-top-right', // Posición del toast
          }).onHidden.subscribe(() => {
            // Redirigir al login después de que el toast se haya ocultado
            this.authService.logout(true); // Redirigir inmediatamente, cerrar sesión
          });
        } else {
          this.toastr.error('Ocurrió un error al cargar las estadísticas.', 'Error');
        }
      }
    });
  }

  syncData() {
    this.isSyncing = true;
    this.syncMessage = 'Sincronizando datos...';

    this.authService.syncData().subscribe({
      next: () => {
        this.syncMessage = 'Sincronización completada';
        this.isSyncing = false;
        this.lastSyncTime = new Date().toLocaleString(); // Actualizar la última fecha de sincronización
        localStorage.setItem('lastSyncTime', this.lastSyncTime); // Guardar en localStorage
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

  // Método para mostrar el toast
  showError(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    // Ocultar el toast después de 5 segundos
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  // Método para ocultar el toast
  hideToast(): void {
    this.showToast = false;
  }

  // Método para restablecer el estado de error al hacer clic en el input
  resetInputError(input: 'startYear' | 'endYear' | 'startMonth' | 'endMonth'): void {
    const property = `is${input[0].toUpperCase() + input.slice(1)}Invalid` as keyof DashboardComponent;
    (this[property] as boolean) = false;
  }
}