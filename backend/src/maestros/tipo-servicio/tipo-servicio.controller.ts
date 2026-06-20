import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TipoServicioService } from './tipo-servicio.service';
import { CreateTipoServicioDto } from './dto/create-tipo-servicio.dto';
import { UpdateTipoServicioDto } from './dto/update-tipo-servicio.dto';

@Controller('maestros/tipo-servicio')
@UseGuards(JwtAuthGuard)
export class TipoServicioController {
  constructor(private readonly svc: TipoServicioService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() body: CreateTipoServicioDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTipoServicioDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
