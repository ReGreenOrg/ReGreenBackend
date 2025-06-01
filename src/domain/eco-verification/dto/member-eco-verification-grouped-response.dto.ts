export interface MemberEcoVerificationDto {
  memberEcoVerificationId: string;
  type: string;
  ecoLovePoint: number;
  breakupBufferPoint: number;
  status: string;
}

export interface MemberEcoVerificationGroupedDto {
  memberId: string;
  nickname: string;
  memberEcoVerifications: MemberEcoVerificationDto[];
}
