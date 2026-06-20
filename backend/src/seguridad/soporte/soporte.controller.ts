import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SoporteService } from './soporte.service';
import { CreateSoporteDto } from './dto/create-soporte.dto';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seguridad/soporte')
@UseGuards(JwtAuthGuard)
export class SoporteController {
  constructor(private readonly svc: SoporteService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSoporteDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<CreateSoporteDto>) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Get(':id/seguimientos')
  findSeguimientos(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findSeguimientos(id);
  }

  @Post(':id/seguimientos')
  createSeguimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateSeguimientoDto,
  ) {
    return this.svc.createSeguimiento(id, body);
  }
}
