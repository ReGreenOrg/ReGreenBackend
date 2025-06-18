import { MemberSummaryDto } from '../../member/dto/member-summary.dto';

export class CoupleDto {
  coupleId: string;
  name: string;
  profileImageUrl: string;
  ecoLovePoint: number;
  breakupBufferPoint: number;
  cumulativeEcoLovePoints: number;
  ecoScore: number;
  rank?: number | null;
  members: MemberSummaryDto[];
}
