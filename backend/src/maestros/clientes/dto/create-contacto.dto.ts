import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContactoDto {
  @IsOptional()
  @IsNumber()
  cargo?: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del contacto es requerido' })
  nombre: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  comentario?: string;
}
