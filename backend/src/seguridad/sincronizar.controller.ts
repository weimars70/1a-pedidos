import { Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SincronizarService } from './sincronizar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('seguridad/sincronizar')
@UseGuards(JwtAuthGuard)
export class SincronizarController {
  constructor(private readonly svc: SincronizarService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  sincronizar() {
    return this.svc.sincronizar();
  }
}
