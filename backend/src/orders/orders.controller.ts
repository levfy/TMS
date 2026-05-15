import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.entity';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Список заявок' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Статистика заявок' })
  stats(@Request() req: any) {
    return this.service.getStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детали заявки' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать заявку' })
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, companyId: req.user.companyId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить заявку' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Изменить статус заявки' })
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.service.updateStatus(id, body.status);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Назначить водителя и машину' })
  assign(@Param('id') id: string, @Body() body: { driverId: string; vehicleId: string }) {
    return this.service.assign(id, body.driverId, body.vehicleId);
  }
}
