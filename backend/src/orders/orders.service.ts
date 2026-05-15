import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  async findAll(companyId?: string) {
    return this.repo.find({
      where: companyId ? { companyId } : {},
      relations: ['driver', 'vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.repo.findOne({
      where: { id },
      relations: ['driver', 'vehicle', 'company'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: Partial<OrderEntity>) {
    return this.repo.save(this.repo.create({ ...data, status: OrderStatus.DRAFT }));
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    await this.repo.update(id, { status });
    return this.findOne(id);
  }

  async assign(id: string, driverId: string, vehicleId: string) {
    await this.findOne(id);
    await this.repo.update(id, { driverId, vehicleId, status: OrderStatus.ASSIGNED });
    return this.findOne(id);
  }

  async update(id: string, data: Partial<OrderEntity>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async getStats(companyId: string) {
    const orders = await this.findAll(companyId);
    return {
      total: orders.length,
      draft: orders.filter(o => o.status === OrderStatus.DRAFT).length,
      assigned: orders.filter(o => o.status === OrderStatus.ASSIGNED).length,
      inTransit: orders.filter(o => o.status === OrderStatus.IN_TRANSIT).length,
      completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      totalRevenue: orders
        .filter(o => o.status === OrderStatus.COMPLETED)
        .reduce((sum, o) => sum + Number(o.price || 0), 0),
    };
  }
}
