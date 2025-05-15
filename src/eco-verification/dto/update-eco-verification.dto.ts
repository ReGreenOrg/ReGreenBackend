import { PartialType } from '@nestjs/mapped-types';
import { EcoVerificationDto } from './eco-verification.dto';

export class UpdateEcoVerificationDto extends PartialType(EcoVerificationDto) {}
