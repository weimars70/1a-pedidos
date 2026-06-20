import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Controller('maestros/clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly svc: ClientesService) {}

  // ── Options (must come before :id routes) ──
  @Get('options/ciudades')       getCiudades()       { return this.svc.getCiudadesOptions(); }
  @Get('options/sectores')       getSectores()       { return this.svc.getSectoresOptions(); }
  @Get('options/contactos-tipo') getContactosTipo()  { return this.svc.getContactosTipoOptions(); }

  // ── CRUD ──
  @Get()      findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()     create(@Body() body: CreateClienteDto) { return this.svc.create(body); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateClienteDto) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  // ── Contactos ──
  @Get(':id/contactos')
  getContactos(@Param('id', ParseIntPipe) id: number) { return this.svc.getContactos(id); }

  @Post(':id/contactos')
  addContacto(@Param('id', ParseIntPipe) id: number, @Body() body: CreateContactoDto) {
    return this.svc.addContacto(id, body);
  }

  @Delete(':id/contactos/:cid')
  removeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Param('cid', ParseIntPipe) cid: number,
  ) { return this.svc.removeContacto(id, cid); }
}
