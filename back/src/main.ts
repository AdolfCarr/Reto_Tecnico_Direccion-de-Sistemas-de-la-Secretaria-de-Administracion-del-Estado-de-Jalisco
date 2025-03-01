import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataService } from './data/data.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS
  app.enableCors({
    origin: 'http://localhost:4200', // URL del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
