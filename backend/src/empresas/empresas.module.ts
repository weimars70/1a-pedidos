import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';

@Module({
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
