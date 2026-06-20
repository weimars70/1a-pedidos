import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateContratoDto {
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @IsNumber()
  @IsNotEmpty({ message: 'El cliente es requerido' })
  id_cliente: number;

  @IsOptional()
  @IsNumber()
  personas?: number;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_terminacion?: string;

  @IsOptional()
  @IsNumber()
  tipo?: number;

  @IsOptional()
  @IsNumber()
  perfil?: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class UpdateContratoDto extends PartialType(CreateContratoDto) {}
