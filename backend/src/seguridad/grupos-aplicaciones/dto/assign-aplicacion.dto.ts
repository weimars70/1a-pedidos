import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignAplicacionDto {
  @IsNumber()
  @IsNotEmpty()
  grupoId: number;

  @IsNumber()
  @IsNotEmpty()
  aplicacionId: number;
}
