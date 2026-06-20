import { IsNotEmpty, IsOptional, IsNumber, IsString, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  empresa?: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
