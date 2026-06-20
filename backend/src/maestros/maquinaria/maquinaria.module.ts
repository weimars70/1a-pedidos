import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaquinariaController } from './maquinaria.controller';
import { MaquinariaService } from './maquinaria.service';
import { Maquinaria } from './maquinaria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maquinaria])],
  controllers: [MaquinariaController],
  providers: [MaquinariaService],
})
export class MaquinariaModule {}
