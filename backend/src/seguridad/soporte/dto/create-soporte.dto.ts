import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSoporteDto {
  @IsString()
  @IsNotEmpty()
  novedad: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
