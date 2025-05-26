import { OmitType } from '@nestjs/mapped-types';
import { MemberResponseDto } from './member-response.dto';

export class MemberSummaryDto extends OmitType(MemberResponseDto, [
  'memberId',
  'coupleId',
  'email',
] as const) {}
