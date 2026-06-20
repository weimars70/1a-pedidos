import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsNumber()
  sucursal?: number;

  @IsOptional()
  @IsString()
  pswd?: string;
}
