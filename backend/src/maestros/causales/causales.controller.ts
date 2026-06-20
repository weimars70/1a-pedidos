import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CausalesService } from './causales.service';
import { CreateCausalDto } from './dto/create-causal.dto';
import { UpdateCausalDto } from './dto/update-causal.dto';

@Controller('maestros/causales')
@UseGuards(JwtAuthGuard)
export class CausalesController {
  constructor(private readonly svc: CausalesService) {}

  @Get()    findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()   create(@Body() body: CreateCausalDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCausalDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
