import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCesantiaDto {
  @IsString()
  @IsNotEmpty({ message: 'El empleado es requerido' })
  empleado: string;

  @IsDateString({}, { message: 'Fecha inválida' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @IsString()
  @IsNotEmpty({ message: 'La firma es requerida' })
  firma: string;

  @IsOptional()
  @IsNumber()
  usuario?: number;
}
