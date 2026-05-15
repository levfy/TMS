import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyEntity } from '../companies/entities/company.entity';

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_TRIP = 'ON_TRIP',
}

@Entity('drivers')
export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column() firstName!: string;
  @Column() lastName!: string;
  @Column({ unique: true }) phone!: string;
  @Column({ unique: true }) iin!: string; // ИИН
  @Column({ nullable: true }) licenseNumber!: string;
  @Column({ nullable: true }) licenseCategory!: string;
  @Column({ nullable: true }) photoUrl!: string;
  @Column({ type: 'varchar', default: DriverStatus.ACTIVE }) status!: DriverStatus;
  @Column({ nullable: true }) currentLatitude!: number;
  @Column({ nullable: true }) currentLongitude!: number;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;

  @Column({ nullable: true, name: 'company_id' }) companyId!: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
