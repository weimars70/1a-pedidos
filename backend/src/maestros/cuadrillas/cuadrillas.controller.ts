import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CuadrillasService } from './cuadrillas.service';
import { CreateCuadrillaDto } from './dto/create-cuadrilla.dto';
import { UpdateCuadrillaDto } from './dto/update-cuadrilla.dto';

@Controller('maestros/cuadrillas')
@UseGuards(JwtAuthGuard)
export class CuadrillasController {
  constructor(private readonly svc: CuadrillasService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() body: CreateCuadrillaDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCuadrillaDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
