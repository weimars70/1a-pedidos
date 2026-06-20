import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSeguimientoDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsOptional()
  @IsString()
  usuario?: string;
}
