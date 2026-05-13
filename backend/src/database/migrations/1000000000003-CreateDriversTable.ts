import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 003: Create drivers table
 *
 * Таблица водителей с документами и статусами
 */
export class CreateDriversTable1000000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'drivers',
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
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'iin',
            type: 'varchar',
            length: '12',
            isUnique: true,
            comment: 'Individual Identification Number (ИИН)',
          },
          {
            name: 'license_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'license_category',
            type: 'varchar',
            length: '20',
            comment: 'B, C, D categories',
          },
          {
            name: 'license_expiry_date',
            type: 'date',
          },
          {
            name: 'photo_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'ON_VACATION'],
            default: "'ACTIVE'",
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 5,
          },
          {
            name: 'completed_trips',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_distance_km',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
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
      'drivers',
      new TableIndex({ columnNames: ['company_id'] }),
    );
    await queryRunner.createIndex(
      'drivers',
      new TableIndex({ columnNames: ['iin'] }),
    );
    await queryRunner.createIndex(
      'drivers',
      new TableIndex({ columnNames: ['license_number'] }),
    );
    await queryRunner.createIndex(
      'drivers',
      new TableIndex({ columnNames: ['status'] }),
    );

    // Foreign key
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK_drivers_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('drivers');
  }
}
