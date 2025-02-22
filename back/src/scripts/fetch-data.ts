import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { DataService } from '../../src/data/data.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataService = app.get(DataService);
  await dataService.fetchAndSaveData();
  await app.close();
}

run().catch(console.error);