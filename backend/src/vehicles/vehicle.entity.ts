import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyEntity } from '../companies/entities/company.entity';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('vehicles')
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true }) plateNumber!: string; // Гос. номер
  @Column() brand!: string;
  @Column() model!: string;
  @Column({ nullable: true }) year!: number;
  @Column({ nullable: true }) vin!: string;
  @Column({ nullable: true }) bodyType!: string; // Тип кузова
  @Column({ nullable: true }) capacity!: number; // Грузоподъемность (тонн)
  @Column({ type: 'varchar', default: VehicleStatus.AVAILABLE }) status!: VehicleStatus;
  @Column({ nullable: true }) photoUrl!: string;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;

  @Column({ nullable: true, name: 'company_id' }) companyId!: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
