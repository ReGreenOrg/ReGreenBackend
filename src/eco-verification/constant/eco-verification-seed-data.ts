import { DeepPartial } from 'typeorm';
import { EcoVerification } from '../entities/eco-verification.entity';

export const ECO_VERIFICATION_SEEDS: DeepPartial<EcoVerification>[] = [
  {
    code: 'green01',
    title: '다회용 컵 이용하기',
    point: 50,
    breakupAtPoint: 2,
    iconS3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/cup.png',
  },
  {
    code: 'green02',
    title: '중고 제품 나눔/구매 인증하기',
    point: 100,
    breakupAtPoint: 10,
    iconS3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/reuse.png',
  },
  {
    code: 'green03',
    title: '플로깅 데이트하기',
    point: 250,
    breakupAtPoint: 31,
    iconS3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/plogging.png',
  },
];
