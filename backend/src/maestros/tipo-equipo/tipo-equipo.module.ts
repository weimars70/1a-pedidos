import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoEquipoController } from './tipo-equipo.controller';
import { TipoEquipoService } from './tipo-equipo.service';
import { TipoEquipo } from './tipo-equipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoEquipo])],
  controllers: [TipoEquipoController],
  providers: [TipoEquipoService],
})
export class TipoEquipoModule {}
