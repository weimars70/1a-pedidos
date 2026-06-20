import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausalesController } from './causales.controller';
import { CausalesService } from './causales.service';
import { Causal } from './causal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Causal])],
  controllers: [CausalesController],
  providers: [CausalesService],
})
export class CausalesModule {}
