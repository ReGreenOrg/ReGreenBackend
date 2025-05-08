import { PartialType } from '@nestjs/mapped-types';
import { CreateCoupleDto } from './create-couple.dto';

export class UpdateCoupleDto extends PartialType(CreateCoupleDto) {}
