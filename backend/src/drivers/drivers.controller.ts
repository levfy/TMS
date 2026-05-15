import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DriversService } from './drivers.service';

@ApiTags('Drivers')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Список водителей компании' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Профиль водителя' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить водителя' })
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, companyId: req.user.companyId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить водителя' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить водителя' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
