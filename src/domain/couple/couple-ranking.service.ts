import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { RankingDto } from './dto/ranking.dto';
import { IGNORE_COUPLE_IDS } from '../eco-verification/constant/ignore-couple-ids';
import { coupleScoreQB } from './constant/score-query.helper';
import { PaginatedDto } from '../../common/dto/paginated.dto';

@Injectable()
export class CoupleRankingService {
  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
  ) {}

  /* ---------------- 랭킹 리스트 ---------------- */
  async getRankings(page = 1, limit = 30): Promise<PaginatedDto<RankingDto>> {
    const offset = (page - 1) * limit;

    const qb = coupleScoreQB(
      this.coupleRepo.manager.connection,
      { cum: 1, avg: 0.3 },
      IGNORE_COUPLE_IDS,
    )
      .orderBy('ecoScore', 'DESC')
      .addOrderBy('ecoVerificationCount', 'DESC')
      .addOrderBy('createdAt', 'ASC')
      .offset(offset)
      .limit(limit);

    const [rows, total] = await Promise.all([
      qb.getRawMany<RankingDto>(),
      this.coupleRepo.count({
        where: { id: Not(In(IGNORE_COUPLE_IDS)) },
      }),
    ]);

    return {
      results: rows.map((r) => ({
        coupleId: r.coupleId,
        name: r.name,
        profileImageUrl: r.profileImageUrl,
        ecoScore: Number(r.ecoScore),
        cumulativeEcoLovePoints: Number(r.cumulativeEcoLovePoints),
        ecoVerificationCount: Number(r.ecoVerificationCount),
      })),
      total,
      limit,
      page,
    };
  }
}
