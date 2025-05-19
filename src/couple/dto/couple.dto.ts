import { MemberSummaryDto } from '../../member/dto/member-summary.dto';

export class CoupleDto {
  coupleId: string;
  ecoLovePoint: number;
  breakupBufferPoint: number;
  members: MemberSummaryDto[];
}
