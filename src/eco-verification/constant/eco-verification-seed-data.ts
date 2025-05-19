import { DeepPartial } from 'typeorm';
import { EcoVerification } from '../entities/eco-verification.entity';

export const ECO_VERIFICATION_SEEDS: DeepPartial<EcoVerification>[] = [
  {
    code: '20250524-00',
    title: '다회용 컵 이용하기',
    ecoLovePoint: 50,
    breakupBufferPoint: 2,
    iconImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/cup.png',
  },
  {
    code: '20250524-01',
    title: '중고 제품 나눔/구매 인증하기',
    ecoLovePoint: 100,
    breakupBufferPoint: 10,
    iconImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/reuse.png',
  },
  {
    code: '20250524-02',
    title: '플로깅 데이트하기',
    ecoLovePoint: 250,
    breakupBufferPoint: 31,
    iconImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/plogging.png',
  },
];
