import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MaquinariaService } from './maquinaria.service';
import { CreateMaquinariaDto } from './dto/create-maquinaria.dto';
import { UpdateMaquinariaDto } from './dto/update-maquinaria.dto';

@Controller('maestros/maquinaria')
@UseGuards(JwtAuthGuard)
export class MaquinariaController {
  constructor(private readonly svc: MaquinariaService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() body: CreateMaquinariaDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMaquinariaDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
