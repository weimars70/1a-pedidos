import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAplicacionDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  icono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
