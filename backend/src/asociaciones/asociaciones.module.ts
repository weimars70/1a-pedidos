import { Module } from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { AsociacionesController } from './asociaciones.controller';

@Module({
  providers: [AsociacionesService],
  controllers: [AsociacionesController],
})
export class AsociacionesModule {}
