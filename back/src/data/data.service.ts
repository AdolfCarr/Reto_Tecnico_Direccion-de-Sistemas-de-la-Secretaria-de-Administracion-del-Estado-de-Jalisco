import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportData } from '../entities/transport-data.entity';
import { TransportType } from '../entities/transport-type.entity';
import { MetricType } from '../entities/metric-type.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
  ) {}

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
}