import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataService } from './data/data.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
