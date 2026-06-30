import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClienteDto {
  @IsOptional()
  @IsString()
  ident?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsOptional()
  @IsString()
  ciudad_codigo?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  centro_costos?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tope_credito?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cod_supervisor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codigo_sector?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
