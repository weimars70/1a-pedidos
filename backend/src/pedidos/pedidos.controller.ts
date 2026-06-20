import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Patch, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly svc: PedidosService) {}

  // ── Literal GET routes (must come before /:id) ──────────────────────────

  @Get('personal')
  findPersonal() {
    return this.svc.findPersonal();
  }

  @Get('personal-programados')
  findPersonalProgramados() {
    return this.svc.findPersonalProgramados();
  }

  @Get('anulados')
  findAnulados() {
    return this.svc.findAnulados();
  }

  @Get('facturados')
  findFacturados() {
    return this.svc.findFacturados();
  }

  @Get('a-facturar')
  findAFacturar() {
    return this.svc.findAFacturar();
  }

  @Get('enviados-coordinador')
  findEnviadosCoordinador() {
    return this.svc.findEnviadosCoordinador();
  }

  @Get('epp')
  findEpp() {
    return this.svc.findEpp();
  }

  @Get('epp-dotacion')
  findEppDotacion() {
    return this.svc.findEppDotacion();
  }

  @Get('epp-dotacion-procesado')
  findEppDotacionProcesado() {
    return this.svc.findEppDotacionProcesado();
  }

  @Patch('epp-dotacion/procesar')
  procesarEppDotacion(@Body('ids') ids: number[]) {
    return this.svc.procesarEppDotacion(ids);
  }

  @Get('empleados')
  findEmpleados() {
    return this.svc.findEmpleados();
  }

  @Get('areas')
  findAreas() {
    return this.svc.findAreas();
  }

  @Get('especiales')
  findEspeciales() {
    return this.svc.findEspeciales();
  }

  @Get('especiales-programados')
  findEspecialesProgramados() {
    return this.svc.findEspecialesProgramados();
  }

  @Get('especiales-areas')
  findEspecialesAreas() {
    return this.svc.findEspecialesAreas();
  }

  @Get('supervision')
  findSupervision() {
    return this.svc.findSupervision();
  }

  // ── Root GET ─────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // ── Parameterised routes (after all literal paths) ───────────────────────

  @Patch(':id/facturado')
  updateFacturado(
    @Param('id', ParseIntPipe) id: number,
    @Body('facturado') facturado: string,
  ) {
    return this.svc.updateFacturado(id, facturado);
  }

  @Put(':id/anular')
  anularPersonal(@Param('id', ParseIntPipe) id: number) {
    return this.svc.anularPersonal(id);
  }

  @Put(':id/programar')
  programarPersonal(@Param('id', ParseIntPipe) id: number) {
    return this.svc.programarPersonal(id);
  }

  @Put(':id/enviar-coordinador')
  enviarCoordinador(@Param('id', ParseIntPipe) id: number) {
    return this.svc.enviarCoordinador(id);
  }

  // ── POST routes ───────────────────────────────────────────────────────────

  @Post('especiales')
  createEspecial(@Body() body: Record<string, unknown>) {
    return this.svc.createEspecial(body);
  }

  @Post('registrar')
  registrar(@Body() body: { pedido: Record<string, unknown>; personal: Record<string, unknown>[] }) {
    return this.svc.registrar(body.pedido, body.personal);
  }

  @Post('especiales/registrar')
  registrarEspecial(@Body() body: { pedido: Record<string, unknown>; equipos: Record<string, unknown>[] }) {
    return this.svc.registrarEspecial(body.pedido, body.equipos);
  }

  @Put('especiales/:id')
  updateEspecial(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.svc.updateEspecial(id, body);
  }

  @Delete('especiales/:id')
  deleteEspecial(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteEspecial(id);
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    const pedido = await this.svc.create(body);
    await this.svc.createPersonal(pedido.id, body);
    return pedido;
  }
}
