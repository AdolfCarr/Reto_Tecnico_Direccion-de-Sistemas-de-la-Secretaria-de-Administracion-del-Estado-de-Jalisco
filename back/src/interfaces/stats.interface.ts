export interface Stats {
    totalRevenue: number;               // Ingresos por pasaje
    totalPassengers: number;            // Pasajeros transportados
    totalKilometers: number;            // Kilómetros recorridos
    totalServiceLength: number;         // Longitud de servicio
    totalUnits: number;                 // Unidades en operación
    totalLines: number;                 // Líneas en servicio
    totalWeekdayBuses: number;          // Autobuses en operación de lunes a viernes
    totalWeekendBuses: number;          // Autobuses en operación de sábado a domingo
    totalPaidPassengers: number;        // Pasajeros transportados con boleto pagado
    totalCourtesyPassengers: number;    // Pasajeros transportados con cortesía
    totalDiscountedPassengers: number;  // Pasajeros transportados con descuento
    totalRoutes: number;                // Rutas
  }