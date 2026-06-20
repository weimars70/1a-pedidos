import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GruposAplicacionesService } from './grupos-aplicaciones.service';
import { AssignAplicacionDto } from './dto/assign-aplicacion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seguridad')
@UseGuards(JwtAuthGuard)
export class GruposAplicacionesController {
  constructor(private readonly svc: GruposAplicacionesService) {}

  @Get('grupos/:id/aplicaciones')
  getAplicacionesForGrupo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getAplicacionesForGrupo(id);
  }

  @Post('grupos-aplicaciones')
  assign(@Body() body: AssignAplicacionDto) {
    return this.svc.assign(body.grupoId, body.aplicacionId);
  }

  @Delete('grupos-aplicaciones/remove')
  removeByGrupoAndApp(@Body() body: AssignAplicacionDto) {
    return this.svc.removeByGrupoAndApp(body.grupoId, body.aplicacionId);
  }
}
