import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { RankingDto } from './dto/ranking.dto';

@Injectable()
export class CoupleRankingService {
  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
  ) {}

  async getRankings(
    page = 1,
    limit = 30,
    excludeIds: string[] = [
      '91183a8e-2edf-472d-a41e-aee9f559f0fa',
      '87e5f18c-d50c-4681-8579-ebde339ddb24',
    ],
  ): Promise<PaginatedDto<RankingDto>> {
    const offset = (page - 1) * limit;

    const qb = this.coupleRepo
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
      .addSelect('COALESCE(a.ecoVerificationCount, 0)', 'ecoVerificationCount')
      // ecoScore = hearts + ecoVerificationCount * 10
      .addSelect(
        'c.cumulativeEcoLovePoints + COALESCE(a.ecoVerificationCount, 0) * 10',
        'ecoScore',
      );

    if (excludeIds.length > 0) {
      qb.andWhere('c.id NOT IN (:...excludeIds)', { excludeIds });
    }
    qb.orderBy('ecoScore', 'DESC')
      .addOrderBy('c.id', 'ASC')
      .offset(offset)
      .limit(limit);

    const [rows, total] = await Promise.all([
      qb.getRawMany<RankingDto>(),
      (() => {
        const countQb = this.coupleRepo.createQueryBuilder('c');
        if (excludeIds.length > 0) {
          countQb.where('c.id NOT IN (:...excludeIds)', { excludeIds });
        }
        return countQb.getCount();
      })(),
    ]);

    const results: RankingDto[] = rows.map((r) => ({
      coupleId: r.coupleId,
      name: r.name,
      profileImageUrl: r.profileImageUrl,
      ecoScore: +r.ecoScore,
      cumulativeEcoLovePoints: +r.cumulativeEcoLovePoints,
      ecoVerificationCount: +r.ecoVerificationCount,
    }));

    return {
      results,
      total,
      limit,
      page,
    };
  }
}
