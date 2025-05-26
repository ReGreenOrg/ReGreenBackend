import { EcoVerificationStatus } from '../../member/constants/eco-verification.status.enum';

export class MemberEcoVerificationSummaryResponseDto {
  memberEcoVerificationId: string;
  imageUrl: string;
  status: EcoVerificationStatus;
  aiReasonOfStatus: string;
  createdAt: Date;
}
