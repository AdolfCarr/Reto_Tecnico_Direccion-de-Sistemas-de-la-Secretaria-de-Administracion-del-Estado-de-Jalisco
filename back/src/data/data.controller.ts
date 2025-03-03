import { Controller, Get, Query, UseGuards, Post, InternalServerErrorException } from '@nestjs/common';
import { DataService } from './data.service';
import { TransportData } from '../entities/transport-data.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) { }

  //to bypass authentication temporarily, remove the next AuthGuard from the /data endpoint.
  //The @UseGuards(AuthGuard('jwt')) decorator ensures that only authenticated users (with a 
  // valid JWT token) can access the GET /data endpoint.
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getData(
    @Query('startYear') startYear?: number,
    @Query('endYear') endYear?: number,
    @Query('startMonth') startMonth?: number,
    @Query('endMonth') endMonth?: number,
    @Query('transportType') transportType?: string,
  ): Promise<TransportData[]> {
    return this.dataService.getFilteredData(
      startYear,
      endYear,
      startMonth,
      endMonth,
      transportType,
    );
  }

  /*
  Manual Data Sync Endpoint (/data/sync):
  
  curl -X POST http://localhost:4000/data/sync
  
  The POST /data/sync endpoint allows to manually trigger 
  data synchronization by calling the fetchAndSaveData() method in the DataService.
  */

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  async syncData() {
    try {
      await this.dataService.fetchAndSaveData();
      return { message: 'Data synchronization completed' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to sync data');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats(
    @Query('startYear') startYear?: number,
    @Query('endYear') endYear?: number,
    @Query('startMonth') startMonth?: number,
    @Query('endMonth') endMonth?: number,
    @Query('transportType') transportType?: string,
  ) {
    return this.dataService.getAggregatedStats(
      startYear,
      endYear,
      startMonth,
      endMonth,
      transportType,
    );
  }
}