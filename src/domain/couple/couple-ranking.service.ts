import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { RankingDto } from './dto/ranking.dto';
import { IGNORE_COUPLE_IDS } from '../eco-verification/constant/ignore-couple-ids';
import { coupleScoreQB } from './constant/score-query.helper';

@Injectable()
export class CoupleRankingService {
  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
    private readonly dataSource: DataSource,
  ) {}

  async getRankings(page = 1, limit = 30): Promise<PaginatedDto<RankingDto>> {
    const offset = (page - 1) * limit;

    const qb = coupleScoreQB(
      this.dataSource,
      { cum: 700, avg: 300 },
      IGNORE_COUPLE_IDS,
    )
      .orderBy('ecoScore', 'DESC') // 이미 윈도 함수 기준으로 맞춤
      .addOrderBy('b.ecoCnt', 'DESC')
      .addOrderBy('b.createdAt', 'ASC')
      .offset(offset)
      .limit(limit);

    const [rows, total] = await Promise.all([
      qb.getRawMany<RankingDto>(),
      (() => {
        const cntQb = this.coupleRepo.createQueryBuilder('c');
        if (IGNORE_COUPLE_IDS.length) {
          cntQb.where('c.id NOT IN (:...excludeIds)', {
            excludeIds: IGNORE_COUPLE_IDS,
          });
        }
        return cntQb.getCount();
      })(),
    ]);

    const results: RankingDto[] = rows.map((r) => ({
      coupleId: r.coupleId,
      name: r.name,
      profileImageUrl: r.profileImageUrl,
      ecoScore: Number(r.ecoScore),
      cumulativeEcoLovePoints: Number(r.cumulativeEcoLovePoints),
      ecoVerificationCount: Number(r.ecoVerificationCount),
    }));

    return { results, total, limit, page };
  }
}
