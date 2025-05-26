import { IntersectionType } from '@nestjs/mapped-types';
import { EcoVerificationResponseDto } from './eco-verification-response.dto';
import { MemberEcoVerificationSummaryResponseDto } from './member-eco-verification-summary-response.dto';

export class MemberEcoVerificationResponseDto extends IntersectionType(
  EcoVerificationResponseDto,
  MemberEcoVerificationSummaryResponseDto,
) {}
