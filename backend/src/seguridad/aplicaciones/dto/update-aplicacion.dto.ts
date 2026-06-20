import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAplicacionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

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
