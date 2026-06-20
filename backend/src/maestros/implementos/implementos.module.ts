import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImplementosController } from './implementos.controller';
import { ImplementosService } from './implementos.service';
import { Implemento } from './implemento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Implemento])],
  controllers: [ImplementosController],
  providers: [ImplementosService],
})
export class ImplementosModule {}
