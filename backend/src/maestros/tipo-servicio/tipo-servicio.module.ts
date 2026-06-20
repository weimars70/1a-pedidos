import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoServicioController } from './tipo-servicio.controller';
import { TipoServicioService } from './tipo-servicio.service';
import { TipoServicio } from './tipo-servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoServicio])],
  controllers: [TipoServicioController],
  providers: [TipoServicioService],
})
export class TipoServicioModule {}
