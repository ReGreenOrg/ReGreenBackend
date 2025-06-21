import { DataSource } from 'typeorm';
import { EcoVerificationStatus } from '../../member/constants/eco-verification.status.enum';

/* 가중치 기본값 : 누적♥ 1  |  평균♥ 0.3  */
export interface EcoScoreWeights {
  cum: number;
  avg: number;
}

/* ───────────────────────────────────────────────
   1) 커플별 누적♥·인증횟수·평균♥ 집계 서브쿼리
   ─────────────────────────────────────────────── */
export function coupleStatsSubQuery(ds: DataSource) {
  return ds
    .createQueryBuilder()
    .select([
      'c.id                     AS coupleId',
      'c.createdAt              AS createdAt',
      'c.cumulativeEcoLovePoints AS cumHeart',
    ])
    .from('couple', 'c')
    .leftJoin(
      (qb) =>
        qb
          .select('m.coupleId', 'cid')
          .addSelect('COUNT(*)', 'ecoCnt')
          .from('member_eco_verification', 'mev')
          .innerJoin('member', 'm', 'm.id = mev.memberId')
          .where('mev.status = :approved', {
            approved: EcoVerificationStatus.APPROVED,
          })
          .groupBy('m.coupleId'),
      'a',
      'a.cid = c.id',
    )
    .addSelect('COALESCE(a.ecoCnt,0)', 'ecoCnt')
    .addSelect(
      `CASE
         WHEN COALESCE(a.ecoCnt,0)=0 THEN 0
         ELSE c.cumulativeEcoLovePoints / a.ecoCnt
       END`,
      'avgHeart',
    );
}

/* ───────────────────────────────────────────────
   2) ecoScore(절대값) + ranking 을 추가한 공통 QB
   ─────────────────────────────────────────────── */
export function coupleScoreQB(
  ds: DataSource,
  weights: EcoScoreWeights = { cum: 1, avg: 0.3 },
  ignoreIds: string[] = [],
) {
  const sub = coupleStatsSubQuery(ds);

  const qb = ds
    .createQueryBuilder()
    .from('(' + sub.getQuery() + ')', 'b')
    .setParameters(sub.getParameters())
    .select([
      'b.coupleId                AS coupleId',
      'b.createdAt               AS createdAt',
      'b.cumHeart                AS cumulativeEcoLovePoints',
      'b.ecoCnt                  AS ecoVerificationCount',
    ])
    /* ecoScore = 누적♥ * 1 + 평균♥ * 0.3 (소수점 버림) */
    .addSelect(`FLOOR(b.cumHeart * :cumW + b.avgHeart * :avgW)`, 'ecoScore')
    /* ranking : ecoScore ↓ → 인증횟수 ↓ → 결성일 ↑ */
    .addSelect(
      `RANK() OVER (
         ORDER BY
           FLOOR(b.cumHeart * :cumW + b.avgHeart * :avgW) DESC,
           b.ecoCnt DESC,
           b.createdAt ASC
       )`,
      'ranking',
    )
    .setParameters({ cumW: weights.cum, avgW: weights.avg });

  if (ignoreIds.length) {
    qb.where('b.coupleId NOT IN (:...ignoreIds)', { ignoreIds });
  }

  return qb;
}
