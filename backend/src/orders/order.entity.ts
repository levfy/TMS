import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyEntity } from '../companies/entities/company.entity';
import { DriverEntity } from '../drivers/driver.entity';
import { VehicleEntity } from '../vehicles/vehicle.entity';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() fromCity!: string;
  @Column({ nullable: true }) fromAddress!: string;
  @Column() toCity!: string;
  @Column({ nullable: true }) toAddress!: string;
  @Column() cargoName!: string;
  @Column({ nullable: true }) cargoWeight!: number;
  @Column({ nullable: true }) cargoVolume!: number;
  @Column({ type: 'decimal', nullable: true }) price!: number;
  @Column({ type: 'varchar', default: OrderStatus.DRAFT }) status!: OrderStatus;
  @Column({ nullable: true }) notes!: string;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;
  @Column({ nullable: true, name: 'company_id' }) companyId!: string;

  @ManyToOne(() => DriverEntity, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver!: DriverEntity;
  @Column({ nullable: true, name: 'driver_id' }) driverId!: string;

  @ManyToOne(() => VehicleEntity, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: VehicleEntity;
  @Column({ nullable: true, name: 'vehicle_id' }) vehicleId!: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
