import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 004: Create vehicles table
 *
 * Таблица транспортных средств с документами и статусами
 */
export class CreateVehiclesTable1000000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'state_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Государственный номер КЗ',
          },
          {
            name: 'vin',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Vehicle Identification Number',
          },
          {
            name: 'make',
            type: 'varchar',
            length: '100',
            comment: 'Марка (Toyota, Volvo)',
          },
          {
            name: 'model',
            type: 'varchar',
            length: '100',
            comment: 'Модель (Corolla, FH16)',
          },
          {
            name: 'year',
            type: 'integer',
          },
          {
            name: 'body_type',
            type: 'varchar',
            length: '50',
            comment: 'Тип кузова (Грузовик, Фургон)',
          },
          {
            name: 'capacity_kg',
            type: 'integer',
            comment: 'Грузоподъёмность',
          },
          {
            name: 'capacity_m3',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Объём кузова',
          },
          {
            name: 'photo_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'registration_certificate',
            type: 'text',
            isNullable: true,
            comment: 'Свидетельство о регистрации',
          },
          {
            name: 'insurance_policy',
            type: 'text',
            isNullable: true,
            comment: 'Номер полиса ОСАГО',
          },
          {
            name: 'insurance_expiry_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'INSPECTION'],
            default: "'ACTIVE'",
          },
          {
            name: 'current_mileage_km',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_maintenance_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'next_maintenance_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Индексы
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({ columnNames: ['company_id'] }),
    );
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({ columnNames: ['state_number'] }),
    );
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({ columnNames: ['vin'] }),
    );
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({ columnNames: ['status'] }),
    );

    // Foreign key
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "FK_vehicles_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vehicles');
  }
}
