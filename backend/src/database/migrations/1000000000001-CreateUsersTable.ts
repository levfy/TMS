import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 001: Create users table
 *
 * Таблица пользователей системы с ролями и статусами
 */
export class CreateUsersTable1000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
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
            name: 'photo_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT'],
            default: "'DRIVER'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING_VERIFICATION'],
            default: "'ACTIVE'",
          },
          {
            name: 'iin',
            type: 'varchar',
            length: '12',
            isNullable: true,
            comment: 'Individual Identification Number (ИИН)',
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login_ip',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'uuid',
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
      'users',
      new TableIndex({ columnNames: ['email'] }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['phone'] }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['company_id'] }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['role'] }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['status'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
