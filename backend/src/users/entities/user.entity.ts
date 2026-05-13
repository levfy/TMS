import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { CompanyEntity } from '../../companies/entities/company.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  DISPATCHER = 'DISPATCHER',
  DRIVER = 'DRIVER',
  CLIENT = 'CLIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  phone!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ nullable: true, name: 'photo_url' })
  photoUrl!: string;

  @Column({ type: 'varchar', default: UserRole.DRIVER })
  role!: UserRole;

  @Column({ type: 'varchar', default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ nullable: true })
  iin!: string;

  @Column({ nullable: true, name: 'last_login_at', type: 'timestamp' })
  lastLoginAt!: Date;

  @Column({ nullable: true, name: 'last_login_ip' })
  lastLoginIp!: string;

  @ManyToOne(() => CompanyEntity, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;

  @Column({ nullable: true, name: 'company_id' })
  companyId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
