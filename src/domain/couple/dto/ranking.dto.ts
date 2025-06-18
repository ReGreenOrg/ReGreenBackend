import { PickType } from '@nestjs/mapped-types';
import { CoupleDto } from './couple.dto';

export class RankingDto extends PickType(CoupleDto, [
  'coupleId',
  'name',
  'profileImageUrl',
]) {
  ecoScore: number;
  cumulativeEcoLovePoints: number;
  ecoVerificationCount: number;
}
