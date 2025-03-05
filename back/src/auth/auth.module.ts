import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataService } from '../data/data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportData } from '../entities/transport-data.entity';
import { TransportType } from '../entities/transport-type.entity';
import { MetricType } from '../entities/metric-type.entity';
import { HttpModule } from '@nestjs/axios'; 

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TransportData, TransportType, MetricType]),
    HttpModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, DataService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}