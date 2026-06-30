import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateClienteDto } from './create-cliente.dto';

// En UPDATE, nombre es opcional y no requiere @IsNotEmpty
// para no bloquear actualizaciones de clientes con nombre vacío en BD
export class UpdateClienteDto extends PartialType(OmitType(CreateClienteDto, ['nombre'] as const)) {
  @IsOptional()
  @IsString()
  nombre?: string;
}
