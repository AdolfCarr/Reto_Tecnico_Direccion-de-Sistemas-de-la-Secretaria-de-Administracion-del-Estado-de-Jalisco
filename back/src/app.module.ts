import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { TransportData } from './entities/transport-data.entity';
import { TransportType } from './entities/transport-type.entity';
import { MetricType } from './entities/metric-type.entity';
import { DataService } from './data/data.service';
import { DataController } from './data/data.controller';
import { DataSyncTask } from './tasks/data-sync.task';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [TransportData, TransportType, MetricType],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TransportData, TransportType, MetricType]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [DataController],
  providers: [DataService, DataSyncTask],
})
export class AppModule {}