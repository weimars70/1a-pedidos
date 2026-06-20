import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateMaquinariaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsOptional()
  @IsNumber()
  grupo?: number;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsDateString({}, { message: 'La fecha de compra debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de compra es requerida' })
  fecha_compra: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de baja debe ser una fecha válida' })
  fecha_de_baja?: string;

  @IsOptional()
  @IsNumber()
  usuario?: number;
}
