import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { RankingDto } from './dto/ranking.dto';
import { IGNORE_COUPLE_IDS } from '../eco-verification/constant/ignore-couple-ids';

@Injectable()
export class CoupleRankingService {
  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
  ) {}

  /**
   * ecoScore(0–1000) = 누적♥ 70 % + 평균♥ 30 %
   * 정렬 우선순위
   *   ① ecoScore
   *   ② 인증 횟수
   *   ③ 결성일
   */
  async getRankings(page = 1, limit = 30): Promise<PaginatedDto<RankingDto>> {
    const offset = (page - 1) * limit;

    /* ───────── 커플별 누적♥·인증횟수·평균♥ ───────── */
    const base = this.coupleRepo
      .createQueryBuilder('c')
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
      .addSelect('c.id', 'coupleId')
      .addSelect('c.name', 'name')
      .addSelect('c.profileImageUrl', 'profileImageUrl')
      .addSelect('c.cumulativeEcoLovePoints', 'cumulativeEcoLovePoints')
      .addSelect('COALESCE(a.ecoVerificationCount,0)', 'ecoVerificationCount')
      .addSelect(
        `CASE
         WHEN COALESCE(a.ecoVerificationCount,0)=0 THEN 0
         ELSE c.cumulativeEcoLovePoints / a.ecoVerificationCount
       END`,
        'avgHeart',
      );

    /* ───────── ecoScore(0 ~ 1000, 정수) ───────── */
    const qb = this.coupleRepo
      .createQueryBuilder()
      .select('*')
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
      .from(`(${base.getQuery()})`, 'b')
      .setParameters(base.getParameters());

    if (IGNORE_COUPLE_IDS.length) {
      qb.where('b.coupleId NOT IN (:...excludeIds)', {
        excludeIds: IGNORE_COUPLE_IDS,
      });
    }

    /* ───────── 정렬 ───────── */
    qb.orderBy('ecoScore', 'DESC') // ① ecoScore
      .addOrderBy('b.ecoVerificationCount', 'DESC') // ② 인증 횟수
      .addOrderBy('b.createdAt', 'ASC') // ③ 가입일
      .offset(offset)
      .limit(limit);

    /* ───────── 조회 & 매핑 ───────── */
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
      ecoScore: Number(r.ecoScore), // 정수 형태
      cumulativeEcoLovePoints: Number(r.cumulativeEcoLovePoints),
      ecoVerificationCount: Number(r.ecoVerificationCount),
    }));

    return { results, total, limit, page };
  }
}
