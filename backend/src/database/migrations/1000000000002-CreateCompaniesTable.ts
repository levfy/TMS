import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 002: Create companies table
 *
 * Таблица компаний-перевозчиков с лицензиями и документами
 */
export class CreateCompaniesTable1000000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'bin',
            type: 'varchar',
            length: '12',
            isUnique: true,
            comment: 'Business Identification Number (БИН)',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['IP', 'TOO', 'AO', 'LLP'],
            default: "'TOO'",
          },
          {
            name: 'name_kk',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
          },
          {
            name: 'address_kk',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'license_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'license_expiry_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'],
            default: "'ACTIVE'",
          },
          {
            name: 'driver_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'vehicle_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'bank_account_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'bank_bik',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'completed_orders',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_revenue',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 5,
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
      'companies',
      new TableIndex({ columnNames: ['bin'] }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({ columnNames: ['email'] }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({ columnNames: ['status'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('companies');
  }
}
