import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CompanyEntity } from '../companies/entities/company.entity';
import { DriverEntity } from '../drivers/driver.entity';
import { VehicleEntity } from '../vehicles/vehicle.entity';
import { OrderEntity } from '../orders/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'postgres'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'kazdispatch'),
        password: configService.get<string>('DB_PASSWORD', 'SecurePassword123!'),
        database: configService.get<string>('DB_NAME', 'kazdispatch_db'),
        entities: [UserEntity, CompanyEntity, DriverEntity, VehicleEntity, OrderEntity],
        synchronize: true,
        logging: false,
        ssl: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
