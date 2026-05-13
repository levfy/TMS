import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 005: Create audit_log table
 *
 * Логирование всех действий пользователей в системе
 */
export class CreateAuditLogTable1000000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_log',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            comment: 'CREATE, UPDATE, DELETE, LOGIN',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '100',
            comment: 'User, Order, Driver, Vehicle',
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'changes',
            type: 'jsonb',
            isNullable: true,
            comment: 'Поля которые изменились',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'SUCCESS'",
            comment: 'SUCCESS, FAILED',
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Индексы
    await queryRunner.createIndex(
      'audit_log',
      new TableIndex({ columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'audit_log',
      new TableIndex({ columnNames: ['entity_type'] }),
    );
    await queryRunner.createIndex(
      'audit_log',
      new TableIndex({ columnNames: ['action'] }),
    );
    await queryRunner.createIndex(
      'audit_log',
      new TableIndex({ columnNames: ['created_at'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_log');
  }
}
