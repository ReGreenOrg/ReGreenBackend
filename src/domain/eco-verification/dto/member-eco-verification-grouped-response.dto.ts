export interface MemberEcoVerificationDto {
  memberEcoVerificationId: string;
  type: string;
  ecoLovePoint: number;
  breakupBufferPoint: number;
  status: string;
  imageUrl: string;
}

export interface MemberEcoVerificationGroupedDto {
  isMe: boolean;
  memberId: string;
  nickname: string;
  memberEcoVerifications: MemberEcoVerificationDto[];
}
