import { PartialType } from '@nestjs/mapped-types';
import { CoupleDto } from './couple.dto';

export class UpdateCoupleDto extends PartialType(CoupleDto) {}
