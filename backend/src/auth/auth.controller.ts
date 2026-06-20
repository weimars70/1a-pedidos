import { Body, Controller, Get, Post, HttpCode, HttpStatus, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarClaveDto } from './dto/cambiar-clave.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('empresas')
  getEmpresas(@Query('usuario') usuario?: string) {
    return this.authService.getEmpresas(usuario);
  }

  @Post('cambiar-clave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cambiarClave(@Body() dto: CambiarClaveDto, @Req() req: Request) {
    return this.authService.cambiarClave((req as any).user.usuario, dto);
  }
}
