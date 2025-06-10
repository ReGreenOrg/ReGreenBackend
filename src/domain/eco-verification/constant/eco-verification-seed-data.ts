import { DeepPartial } from 'typeorm';
import { EcoVerification } from '../entities/eco-verification.entity';
import { EcoVerificationType } from './eco-verification-type.enum';

export const ECO_VERIFICATION_SEEDS: DeepPartial<EcoVerification>[] = [
  {
    code: 'easter-egg-00',
    title: '사전예약 히든미션',
    ecoLovePoint: 100,
    breakupBufferPoint: 0,
    type: EcoVerificationType.EASTER_EGG,
  },
  {
    code: '20250524-00',
    title: '다회용 컵 이용하기',
    ecoLovePoint: 50,
    breakupBufferPoint: 2,
    iconImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/cup.png',
    type: EcoVerificationType.REUSABLE_CUP,
  },
  {
    code: '20250524-01',
    title: '플로깅 데이트하기',
    ecoLovePoint: 250,
    breakupBufferPoint: 31,
    iconImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/eco/plogging.png',
    type: EcoVerificationType.PLOGGING_PROOF,
  },
];
