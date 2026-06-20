import { PartialType } from '@nestjs/mapped-types';
import { CreateCausalDto } from './create-causal.dto';

export class UpdateCausalDto extends PartialType(CreateCausalDto) {}
