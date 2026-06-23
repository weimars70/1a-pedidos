import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch,
  Post, Put, Req, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto, UpdateContratoDto } from './contratos.dto';

interface AuthRequest {
  user?: { id?: string; usuario?: string; empresaId?: number };
}

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
  create(@Body() body: CreateContratoDto, @Req() req: AuthRequest) {
    return this.svc.create(body, req.user?.usuario);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateContratoDto,
  ) {
    return this.svc.update(id, body);
  }

  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.svc.anular(id, req.user?.usuario);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
