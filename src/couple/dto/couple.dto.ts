import { MemberSummaryDto } from '../../member/dto/member-summary.dto';

export class CoupleDto {
  coupleId: string;
  point: number;
  breakupAt: number;
  members: MemberSummaryDto[];
}
