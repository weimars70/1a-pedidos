import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TipoEquipoService } from './tipo-equipo.service';
import { CreateTipoEquipoDto } from './dto/create-tipo-equipo.dto';
import { UpdateTipoEquipoDto } from './dto/update-tipo-equipo.dto';

@Controller('maestros/tipo-equipo')
@UseGuards(JwtAuthGuard)
export class TipoEquipoController {
  constructor(private readonly svc: TipoEquipoService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() body: CreateTipoEquipoDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTipoEquipoDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
