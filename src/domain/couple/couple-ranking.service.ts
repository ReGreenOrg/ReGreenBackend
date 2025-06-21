import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { RankingDto } from './dto/ranking.dto';
import { IGNORE_COUPLE_IDS } from '../eco-verification/constant/ignore-couple-ids';

@Injectable()
export class CoupleRankingService {
  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
    private readonly dataSource: DataSource,
  ) {}

  async getRankings(page = 1, limit = 30): Promise<PaginatedDto<RankingDto>> {
    const offset = (page - 1) * limit;

    const sub = this.coupleRepo
      .createQueryBuilder('c')
      .select([
        'c.id                     AS coupleId',
        'c.createdAt              AS createdAt',
        'c.cumulativeEcoLovePoints AS cumulativeEcoLovePoints',
        'c.profileImageUrl        AS profileImageUrl',
        'c.name                   AS name',
      ])
      .leftJoin(
        (qb) =>
          qb
            .from('member_eco_verification', 'mev')
            .select('m.coupleId', 'cid')
            .addSelect('COUNT(*)', 'ecoVerificationCount')
            .innerJoin('member', 'm', 'm.id = mev.memberId')
            .where('m.coupleId IS NOT NULL')
            .andWhere('mev.status = :approved', { approved: 'APPROVED' })
            .groupBy('m.coupleId'),
        'a',
        'a.cid = c.id',
      )
      .addSelect('COALESCE(a.ecoVerificationCount,0)', 'ecoVerificationCount')
      .addSelect(
        `CASE
         WHEN COALESCE(a.ecoVerificationCount,0)=0 THEN 0
         ELSE c.cumulativeEcoLovePoints / a.ecoVerificationCount
       END`,
        'avgHeart',
      );

    const qb = this.dataSource // entity 없어도 되므로 dataSource 사용
      .createQueryBuilder()
      .from('(' + sub.getQuery() + ')', 'b') // alias b 먼저 선언
      .select([
        'b.coupleId              AS coupleId',
        'b.name                  AS name',
        'b.profileImageUrl       AS profileImageUrl',
        'b.cumulativeEcoLovePoints AS cumulativeEcoLovePoints',
        'b.ecoVerificationCount  AS ecoVerificationCount',
      ])
      .addSelect(
        `FLOOR(
         (b.cumulativeEcoLovePoints
            / NULLIF(MAX(b.cumulativeEcoLovePoints) OVER (),0)
          ) * 700
       + (b.avgHeart
            / NULLIF(MAX(b.avgHeart) OVER (),0)
         ) * 300
       )`,
        'ecoScore',
      )
      .setParameters(sub.getParameters());

    if (IGNORE_COUPLE_IDS.length) {
      qb.where('b.coupleId NOT IN (:...excludeIds)', {
        excludeIds: IGNORE_COUPLE_IDS,
      });
    }

    qb.orderBy('ecoScore', 'DESC')
      .addOrderBy('b.ecoVerificationCount', 'DESC')
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
