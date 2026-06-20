import { IsString, IsNotEmpty } from 'class-validator';

export class CambiarClaveDto {
  @IsString()
  @IsNotEmpty()
  contrasenaAnterior: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;
}
