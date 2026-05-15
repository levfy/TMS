import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Список транспортных средств' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Карточка ТС' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить ТС' })
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, companyId: req.user.companyId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить ТС' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить ТС' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
