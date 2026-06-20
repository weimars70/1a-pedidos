import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  login: string;

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
