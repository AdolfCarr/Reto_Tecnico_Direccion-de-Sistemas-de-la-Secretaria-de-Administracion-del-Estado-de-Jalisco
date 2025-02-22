import { Controller, Get, Query } from '@nestjs/common';
import { DataService } from './data.service';
import { TransportData } from '../entities/transport-data.entity';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query('startYear') startYear?: number,
    @Query('transportType') transportType?: string,
  ): Promise<TransportData[]> {
    return this.dataService.getFilteredData(startYear, transportType);
  }
}