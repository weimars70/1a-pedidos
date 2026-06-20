import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seguridad/usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly svc: UsuariosService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':login')
  findOne(@Param('login') login: string) {
    return this.svc.findOne(login);
  }

  @Post()
  create(@Body() body: CreateUsuarioDto) {
    return this.svc.create(body);
  }

  @Put(':login')
  update(@Param('login') login: string, @Body() body: UpdateUsuarioDto) {
    return this.svc.update(login, body);
  }

  @Delete(':login')
  remove(@Param('login') login: string) {
    return this.svc.remove(login);
  }
}
