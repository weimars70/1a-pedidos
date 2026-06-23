import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateContratoDto {
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @IsNumber()
  @IsNotEmpty({ message: 'El cliente es requerido' })
  id_cliente: number;

  @IsNumber()
  @IsNotEmpty({ message: 'El supervisor/coordinador es requerido' })
  id_supervisor: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La causal es requerida' })
  id_causa: number;

  @IsNumber()
  @IsNotEmpty({ message: 'El número de personas es requerido' })
  personas: number;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de terminación es requerida' })
  fecha_terminacion: string;

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
