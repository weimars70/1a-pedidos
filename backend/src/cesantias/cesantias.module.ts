import { Module } from '@nestjs/common';
import { CesantiasService } from './cesantias.service';
import { CesantiasController } from './cesantias.controller';

@Module({
  providers: [CesantiasService],
  controllers: [CesantiasController],
})
export class CesantiasModule {}
