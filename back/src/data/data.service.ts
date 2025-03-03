import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportData } from '../entities/transport-data.entity';
import { TransportType } from '../entities/transport-type.entity';
import { MetricType } from '../entities/metric-type.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Stats } from '../interfaces/stats.interface';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(TransportData)
    private transportDataRepo: Repository<TransportData>,
    @InjectRepository(TransportType)
    private transportTypeRepo: Repository<TransportType>,
    @InjectRepository(MetricType)
    private metricTypeRepo: Repository<MetricType>,
    private httpService: HttpService,
  ) { }

  /*
  Method to fetch and save data from the external 
  API scheduled by 'data-sync.task.ts' of by the controller by POST
  */
  async fetchAndSaveData() {
    const { data } = await firstValueFrom(
      this.httpService.get('http://apiiieg.jalisco.gob.mx/api/etup'),
    );

    for (const item of data.data) {
      const existing = await this.transportDataRepo.findOneBy({ id: item._id });
      if (!existing) {
        let transportType = await this.transportTypeRepo.findOneBy({ name: item.Transporte });
        if (!transportType) {
          transportType = this.transportTypeRepo.create({ name: item.Transporte });
          await this.transportTypeRepo.save(transportType);
        }

        let metricType = await this.metricTypeRepo.findOneBy({ name: item.Variable });
        if (!metricType) {
          metricType = this.metricTypeRepo.create({ name: item.Variable });
          await this.metricTypeRepo.save(metricType);
        }

        const newData = this.transportDataRepo.create({
          id: item._id,
          year: item.Anio,
          month: item.ID_mes,
          transportType,
          metricType,
          entity: item.Entidad,
          municipality: item.Municipio,
          value: item.Valor ?? 0.00,// Si es null/undefined, usa 0.00
          status: item.Estatus,
        });

        await this.transportDataRepo.save(newData);
      }
    }
  }

  /*
  Method to get filtered data:

  When a client makes a GET request to the /data endpoint, the DataController calls 
  the getFilteredData() method.
  This method queries the database (which has been populated by data-sync.task.ts) 
  and returns the filtered data to the client.
  */
  async getFilteredData(
    startYear?: number,
    endYear?: number,
    startMonth?: number,
    endMonth?: number,
    transportType?: string,
  ): Promise<TransportData[]> {
    const query = this.transportDataRepo
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.transportType', 'transport')
      .leftJoinAndSelect('data.metricType', 'metric');

    if (startYear) {
      query.andWhere('data.year >= :startYear', { startYear });
    }

    if (endYear) {
      query.andWhere('data.year <= :endYear', { endYear });
    }

    if (startMonth) {
      query.andWhere('data.month >= :startMonth', { startMonth });
    }

    if (endMonth) {
      query.andWhere('data.month <= :endMonth', { endMonth });
    }

    if (transportType) {
      query.andWhere('transport.name = :transportType', { transportType });
    }

    return query.getMany();
  }

  async getAggregatedStats(
    startYear?: number,
    endYear?: number,
    startMonth?: number,
    endMonth?: number,
    transportType?: string,
  ): Promise<Stats> {
    const query = this.transportDataRepo
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.transportType', 'transport')
      .leftJoinAndSelect('data.metricType', 'metric');

    if (startYear) query.andWhere('data.year >= :startYear', { startYear });
    if (endYear) query.andWhere('data.year <= :endYear', { endYear });
    if (startMonth) query.andWhere('data.month >= :startMonth', { startMonth });
    if (endMonth) query.andWhere('data.month <= :endMonth', { endMonth });
    if (transportType) query.andWhere('transport.name = :transportType', { transportType });

    const data = await query.getMany();

    // Inicializar estadísticas
    const stats: Stats = {
      totalRevenue: 0,          // Ingresos por pasaje
      totalPassengers: 0,       // Pasajeros transportados
      totalKilometers: 0,       // Kilómetros recorridos
      totalServiceLength: 0,    // Longitud de servicio
      totalUnits: 0,            // Unidades en operación
      totalLines: 0,            // Líneas en servicio
      totalWeekdayBuses: 0,     // Autobuses en operación de lunes a viernes
      totalWeekendBuses: 0,     // Autobuses en operación de sábado a domingo
      totalPaidPassengers: 0,   // Pasajeros transportados con boleto pagado
      totalCourtesyPassengers: 0, // Pasajeros transportados con cortesía
      totalDiscountedPassengers: 0, // Pasajeros transportados con descuento
      totalRoutes: 0,           // Rutas
    };

    // Calcular estadísticas
    data.forEach((item) => {
      switch (item.metricType.name) {
        case 'Ingresos por pasaje':
          stats.totalRevenue += item.value;
          break;
        case 'Pasajeros transportados':
          stats.totalPassengers += item.value;
          break;
        case 'Kilómetros recorridos':
          stats.totalKilometers += item.value;
          break;
        case 'Longitud de servicio':
          stats.totalServiceLength += item.value;
          break;
        case 'Unidades en operación':
          stats.totalUnits += item.value;
          break;
        case 'Lineas en servicio':
          stats.totalLines += item.value;
          break;
        case 'Autobuses en operación de lunes a viernes':
          stats.totalWeekdayBuses += item.value;
          break;
        case 'Autobuses en operación de sábado a domingo':
          stats.totalWeekendBuses += item.value;
          break;
        case 'Pasajeros transportados con boleto pagado':
          stats.totalPaidPassengers += item.value;
          break;
        case 'Pasajeros transportados con cortesía':
          stats.totalCourtesyPassengers += item.value;
          break;
        case 'Pasajeros transportados con descuento':
          stats.totalDiscountedPassengers += item.value;
          break;
        case 'Rutas':
          stats.totalRoutes += item.value;
          break;
      }
    });

    return stats;
  }
}