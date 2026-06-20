import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto, UpdateContratoDto } from './contratos.dto';

@Controller('contratos')
@UseGuards(JwtAuthGuard)
export class ContratosController {
  constructor(private readonly svc: ContratosService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('terminados')
  findTerminados() {
    return this.svc.findTerminados();
  }

  @Post()
  create(@Body() body: CreateContratoDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateContratoDto,
  ) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
