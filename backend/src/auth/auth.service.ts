import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { EmpresasService } from '../empresas/empresas.service';
import { LoginDto } from './dto/login.dto';
import { CambiarClaveDto } from './dto/cambiar-clave.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly empresasService: EmpresasService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    console.log('BACKEND auth.login input:', {
      email: dto.email,
      password: dto.password,
      empresa: dto.empresa,
    });

    const user = await this.usersService.findByEmail(dto.email);
    console.log('BACKEND auth.login user from DB:', user ? {
      email: user.email,
      pswd: user.pswd,
      name: user.name,
      lastName: user.lastName,
      usuario: user.usuario,
    } : null);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatches = await compare(dto.password, user.pswd).catch(() => false);
    if (!passwordMatches) {
      const md5 = createHash('md5').update(dto.password).digest('hex');
      if (user.pswd !== md5) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }
    }

    const empresas = await this.empresasService.findAll();

    if (!dto.empresa) {
      return {
        empresas,
      };
    }

    const payload = {
      sub: user.email,
      usuario: user.email,
      empresaId: dto.empresa,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.email,
        usuario: user.email,
        name: user.name,
        empresaId: dto.empresa,
      },
      empresas,
    };
  }

  async getEmpresas(usuario?: string) {
    if (usuario) {
      const user = await this.usersService.findByEmail(usuario);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
    }
    return this.empresasService.findAll();
  }

  async cambiarClave(usuario: string, dto: CambiarClaveDto) {
    const user = await this.usersService.findByEmail(usuario);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const passwordMatches = await compare(dto.contrasenaAnterior, user.pswd).catch(() => false);
    if (!passwordMatches) {
      const md5Old = createHash('md5').update(dto.contrasenaAnterior).digest('hex');
      if (user.pswd !== md5Old) throw new UnauthorizedException('Contraseña anterior incorrecta');
    }
    const hashedNew = await hash(dto.contrasena, 10);
    await this.usersService.updatePassword(usuario, hashedNew);
    return { message: 'Contraseña actualizada' };
  }
}
