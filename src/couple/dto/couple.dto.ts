import { MemberSummaryDto } from '../../member/dto/member-summary.dto';

export class CoupleDto {
  coupleId: string;
  point: number;
  breakupPoint: number;
  members: MemberSummaryDto[];
}
