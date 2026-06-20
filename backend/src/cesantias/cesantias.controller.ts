import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CesantiasService } from './cesantias.service';
import { CreateCesantiaDto } from './dto/create-cesantia.dto';
import { UpdateCesantiaDto } from './dto/update-cesantia.dto';

@Controller('cesantias')
@UseGuards(JwtAuthGuard)
export class CesantiasController {
  constructor(private readonly svc: CesantiasService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('empleado') empleado?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      search, empleado, fechaDesde, fechaHasta,
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() body: CreateCesantiaDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCesantiaDto,
  ) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
