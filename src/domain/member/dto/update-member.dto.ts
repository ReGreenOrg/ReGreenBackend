import { IsNotEmpty } from 'class-validator';

export class UpdateMemberDto {
  @IsNotEmpty()
  nickname?: string;
}
