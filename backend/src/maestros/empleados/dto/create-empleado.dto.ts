import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class CreateEmpleadoDto {
  @IsOptional()
  @IsString()
  tipoident?: string;

  @IsOptional()
  @IsString()
  ident?: string;

  @IsOptional()
  @IsString()
  codigo_alterno?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  movil?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  email?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsBoolean()
  @IsOptional()
  personal_interno?: boolean;

  @IsOptional()
  @IsNumber()
  sexo?: number;

  @IsOptional()
  @IsNumber()
  perfil?: number;

  @IsOptional()
  @IsNumber()
  profesion_codigo?: number;

  @IsOptional()
  @IsString()
  ciudad_codigo?: string;
}
