import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AsociacionesService } from './asociaciones.service';

@Controller('asociaciones')
@UseGuards(JwtAuthGuard)
export class AsociacionesController {
  constructor(private readonly svc: AsociacionesService) {}

  // ── Options ──
  @Get('options/perfiles')       getPerfiles()       { return this.svc.getPerfilesOptions(); }
  @Get('options/capacitaciones') getCapacitaciones() { return this.svc.getCapacitacionesOptions(); }
  @Get('options/epp')            getEPP()            { return this.svc.getEPPOptions(); }
  @Get('options/implementos')    getImplementos()    { return this.svc.getImplementosOptions(); }
  @Get('options/tipo-equipo')    getTipoEquipo()     { return this.svc.getTipoEquipoOptions(); }
  @Get('options/cuadrillas')     getCuadrillas()     { return this.svc.getCuadrillasOptions(); }
  @Get('options/empleados')      getEmpleados()      { return this.svc.getEmpleadosOptions(); }

  // ── Empleados-Perfil ──
  @Get('empleados-perfil')
  listEP(
    @Query('search') s?: string,
    @Query('perfil') perfil?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) { return this.svc.listEmpleadosPerfil({ search: s, perfil: perfil ? +perfil : undefined, page: page ? +page : 1, limit: limit ? +limit : 50 }); }

  @Post('empleados-perfil')
  createEP(@Body() b: { empleado: string; perfil: number }) {
    return this.svc.createEmpleadoPerfil(b.empleado, b.perfil);
  }

  @Delete('empleados-perfil')
  deleteEP(@Body() b: { empleado: string; perfil: number }) {
    return this.svc.deleteEmpleadoPerfil(b.empleado, b.perfil);
  }

  // ── Supernumerarios ──
  @Get('supernumerarios')
  listSN(@Query('search') s?: string) { return this.svc.listSupernumerarios(s); }

  @Post('supernumerarios')
  createSN(@Body() b: { id_auxiliar: string; id_supernumerario: string }) { return this.svc.createSupernumerario(b); }

  @Delete('supernumerarios/:auxiliar/:supernumerario')
  deleteSN(@Param('auxiliar') a: string, @Param('supernumerario') s: string) { return this.svc.deleteSupernumerario(a, s); }

  // ── Perfiles-Capacitacion ──
  @Get('perfiles-capacitacion')
  listPC(@Query('search') s?: string) { return this.svc.listPerfilesCapacitacion(s); }

  @Post('perfiles-capacitacion')
  createPC(@Body() b: { codigo_perfil: number; codigo_capacitacion: number }) { return this.svc.createPerfilCapacitacion(b); }

  @Delete('perfiles-capacitacion/:perfil/:capacitacion')
  deletePC(@Param('perfil', ParseIntPipe) p: number, @Param('capacitacion', ParseIntPipe) c: number) {
    return this.svc.deletePerfilCapacitacion(p, c);
  }

  // ── Cuadrillas ──
  @Get('cuadrillas')
  listCQ(@Query('search') s?: string) { return this.svc.listCuadrillas(s); }

  @Post('cuadrillas')
  createCQ(@Body() b: { codigo_cuadrilla: number; codigo_empleado: number }) { return this.svc.createCuadrilla(b); }

  @Delete('cuadrillas/:cuadrilla/:empleado')
  deleteCQ(@Param('cuadrilla', ParseIntPipe) c: number, @Param('empleado', ParseIntPipe) e: number) {
    return this.svc.deleteCuadrilla(c, e);
  }

  // ── Perfiles-EPP ──
  @Get('perfiles-epp')
  listPE(@Query('search') s?: string) { return this.svc.listPerfilesEPP(s); }

  @Post('perfiles-epp')
  createPE(@Body() b: { codigo_perfil: number; codigo_epp: number }) { return this.svc.createPerfilEPP(b); }

  @Delete('perfiles-epp/:perfil/:epp')
  deletePE(@Param('perfil', ParseIntPipe) p: number, @Param('epp', ParseIntPipe) e: number) {
    return this.svc.deletePerfilEPP(p, e);
  }

  // ── MYE-Implementos ──
  @Get('mye-implementos')
  listMI(@Query('search') s?: string) { return this.svc.listMYEImplementos(s); }

  @Post('mye-implementos')
  createMI(@Body() b: { codigo_tipo_equipo: number; codigo_implemento: number }) { return this.svc.createMYEImplemento(b); }

  @Delete('mye-implementos/:equipo/:implemento')
  deleteMI(@Param('equipo', ParseIntPipe) eq: number, @Param('implemento', ParseIntPipe) im: number) {
    return this.svc.deleteMYEImplemento(eq, im);
  }
}
