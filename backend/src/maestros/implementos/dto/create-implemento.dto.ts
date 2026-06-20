import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateImplementoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsNumber()
  usuario?: number;
}
