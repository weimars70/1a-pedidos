import { PartialType } from '@nestjs/mapped-types';
import { CreateMaquinariaDto } from './create-maquinaria.dto';

export class UpdateMaquinariaDto extends PartialType(CreateMaquinariaDto) {}
