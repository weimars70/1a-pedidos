import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseInitService } from './database-init.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmpresasModule } from './empresas/empresas.module';
import { CausalesModule } from './maestros/causales/causales.module';
import { CuadrillasModule } from './maestros/cuadrillas/cuadrillas.module';
import { EmpleadosModule } from './maestros/empleados/empleados.module';
import { ImplementosModule } from './maestros/implementos/implementos.module';
import { ClientesModule } from './maestros/clientes/clientes.module';
import { MaquinariaModule } from './maestros/maquinaria/maquinaria.module';
import { PerfilesModule } from './maestros/perfiles/perfiles.module';
import { TipoEquipoModule } from './maestros/tipo-equipo/tipo-equipo.module';
import { TipoServicioModule } from './maestros/tipo-servicio/tipo-servicio.module';
import { CesantiasModule } from './cesantias/cesantias.module';
import { AsociacionesModule } from './asociaciones/asociaciones.module';
import { ContratosModule } from './contratos/contratos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { SeguridadModule } from './seguridad/seguridad.module';
import { LookupModule } from './lookup/lookup.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get<string>('POSTGRES_USER', 'postgres'),
        password: config.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: config.get<string>('POSTGRES_DB', 'unoa'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    EmpresasModule,
    CausalesModule,
    CuadrillasModule,
    EmpleadosModule,
    ImplementosModule,
    ClientesModule,
    MaquinariaModule,
    PerfilesModule,
    TipoEquipoModule,
    TipoServicioModule,
    CesantiasModule,
    AsociacionesModule,
    ContratosModule,
    PedidosModule,
    SeguridadModule,
    LookupModule,
  ],
  providers: [
    {
      provide: DatabaseInitService,
      useFactory: (db: DataSource) => new DatabaseInitService(db),
      inject: [DataSource],
    },
  ],
})
export class AppModule {}
