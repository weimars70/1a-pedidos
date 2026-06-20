import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ImplementosService } from './implementos.service';
import { CreateImplementoDto } from './dto/create-implemento.dto';
import { UpdateImplementoDto } from './dto/update-implemento.dto';

@Controller('maestros/implementos')
@UseGuards(JwtAuthGuard)
export class ImplementosController {
  constructor(private readonly svc: ImplementosService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() body: CreateImplementoDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateImplementoDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
