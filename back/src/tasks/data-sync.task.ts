import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataService } from '../data/data.service';

@Injectable()
export class DataSyncTask {
  constructor(private dataService: DataService) {}
/* Execute each day at 3 AM, This ensures that the 
database is always up-to-date with the latest data from the source.
*/  
@Cron('0 3 * * *') 
  async handleCron() {
    await this.dataService.fetchAndSaveData();
  }
}