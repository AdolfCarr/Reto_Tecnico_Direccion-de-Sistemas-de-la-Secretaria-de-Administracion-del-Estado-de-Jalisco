import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataService } from '../data/data.service';

@Injectable()
export class DataSyncTask {
  constructor(private dataService: DataService) {}

  @Cron('0 3 * * *') // Ejecutar diario a las 3 AM
  async handleCron() {
    await this.dataService.fetchAndSaveData();
  }
}