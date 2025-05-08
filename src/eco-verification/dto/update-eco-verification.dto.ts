import { PartialType } from '@nestjs/mapped-types';
import { CreateEcoVerificationDto } from './create-eco-verification.dto';

export class UpdateEcoVerificationDto extends PartialType(CreateEcoVerificationDto) {}
