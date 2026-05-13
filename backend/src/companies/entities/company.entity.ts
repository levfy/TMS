import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export enum CompanyType {
  CARRIER = 'CARRIER',
  BROKER = 'BROKER',
  SHIPPER = 'SHIPPER',
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  bin!: string;

  @Column({ type: 'varchar', default: CompanyType.CARRIER })
  type!: CompanyType;

  @Column({ nullable: true, name: 'name_kk' })
  nameKk!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true, name: 'address_kk' })
  addressKk!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true, name: 'license_number' })
  licenseNumber!: string;

  @Column({ nullable: true, name: 'license_expiry_date', type: 'timestamp' })
  licenseExpiryDate!: Date;

  @Column({ nullable: true, name: 'logo_url' })
  logoUrl!: string;

  @Column({ type: 'varchar', default: CompanyStatus.ACTIVE })
  status!: CompanyStatus;

  @Column({ default: 0, name: 'driver_count' })
  driverCount!: number;

  @Column({ default: 0, name: 'vehicle_count' })
  vehicleCount!: number;

  @Column({ nullable: true, name: 'bank_account_number' })
  bankAccountNumber!: string;

  @Column({ nullable: true, name: 'bank_bik' })
  bankBik!: string;

  @Column({ default: 0, name: 'completed_orders' })
  completedOrders!: number;

  @Column({ type: 'decimal', default: 0, name: 'total_revenue' })
  totalRevenue!: number;

  @Column({ type: 'decimal', default: 0 })
  rating!: number;

  @OneToMany(() => UserEntity, (user) => user.company)
  users!: UserEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
