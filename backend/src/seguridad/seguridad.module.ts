import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersModule } from '../users/users.module';

import { UsuariosController } from './usuarios/usuarios.controller';
import { UsuariosService } from './usuarios/usuarios.service';

import { Soporte } from './soporte/soporte.entity';
import { SoporteSeguimiento } from './soporte/soporte-seguimiento.entity';
import { SoporteController } from './soporte/soporte.controller';
import { SoporteService } from './soporte/soporte.service';

import { Aplicacion } from './aplicaciones/aplicacion.entity';
import { AplicacionesController } from './aplicaciones/aplicaciones.controller';
import { AplicacionesService } from './aplicaciones/aplicaciones.service';

import { Grupo } from './grupos/grupo.entity';
import { GruposController } from './grupos/grupos.controller';
import { GruposService } from './grupos/grupos.service';

import { GrupoAplicacion } from './grupos-aplicaciones/grupo-aplicacion.entity';
import { GruposAplicacionesController } from './grupos-aplicaciones/grupos-aplicaciones.controller';
import { GruposAplicacionesService } from './grupos-aplicaciones/grupos-aplicaciones.service';

import { SincronizarController } from './sincronizar.controller';
import { SincronizarService } from './sincronizar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Soporte,
      SoporteSeguimiento,
      Aplicacion,
      Grupo,
      GrupoAplicacion,
    ]),
    UsersModule,
  ],
  controllers: [
    UsuariosController,
    SoporteController,
    AplicacionesController,
    GruposController,
    GruposAplicacionesController,
    SincronizarController,
  ],
  providers: [
    UsuariosService,
    SoporteService,
    AplicacionesService,
    GruposService,
    GruposAplicacionesService,
    {
      provide: SincronizarService,
      useFactory: (db: DataSource) => new SincronizarService(db),
      inject: [DataSource],
    },
  ],
})
export class SeguridadModule {}
