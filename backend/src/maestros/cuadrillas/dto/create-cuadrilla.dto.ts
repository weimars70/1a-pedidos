import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCuadrillaDto {
  @IsString()
  @IsNotEmpty({ message: 'El campo nombre es requerido' })
  nombre: string;

  @IsOptional()
  @IsNumber()
  usuario?: number;
}
