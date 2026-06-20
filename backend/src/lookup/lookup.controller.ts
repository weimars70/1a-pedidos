import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LookupService } from './lookup.service';

@Controller('lookup')
@UseGuards(JwtAuthGuard)
export class LookupController {
  constructor(private readonly svc: LookupService) {}

  @Get('clientes')
  getClientes() { return this.svc.getClientes(); }

  @Get('perfiles')
  getPerfiles() { return this.svc.getPerfiles(); }

  @Get('tipo-servicio')
  getTipoServicio() { return this.svc.getTipoServicio(); }

  @Get('sectores')
  getSectores() { return this.svc.getSectores(); }

  @Get('riesgo-arl')
  getRiesgoArl() { return this.svc.getRiesgoArl(); }

  @Get('ciudades')
  getCiudades() { return this.svc.getCiudades(); }

  @Get('tipo-equipo')
  getTipoEquipo() { return this.svc.getTipoEquipo(); }
}
