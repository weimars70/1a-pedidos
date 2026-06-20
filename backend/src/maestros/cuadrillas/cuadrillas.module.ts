import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';
import { Cuadrilla } from './cuadrilla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuadrilla])],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
})
export class CuadrillasModule {}
