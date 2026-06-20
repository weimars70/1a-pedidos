import { PartialType } from '@nestjs/mapped-types';
import { CreateCesantiaDto } from './create-cesantia.dto';

export class UpdateCesantiaDto extends PartialType(CreateCesantiaDto) {}
