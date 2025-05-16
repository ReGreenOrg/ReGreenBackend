import { FurnitureCategory } from './furniture-category.enum';
import { DeepPartial } from 'typeorm';
import { Furniture } from '../entities/furniture.entity';

export const FURNITURE_SEEDS: DeepPartial<Furniture>[] = [
  {
    code: 'green00',
    name: '기본 룸쉘',
    description: '기본 제공 방 구조 (기본 테마)',
    price: 0,
    category: FurnitureCategory.INTERIOR,
    zIndex: 0,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green00.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green00.png',
  },
  {
    code: 'green01',
    name: '자연빛 룸쉘',
    description: '기본 제공 방 구조 (그린 테마)',
    price: 5,
    category: FurnitureCategory.INTERIOR,
    zIndex: 1,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green01.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green01.png',
  },
  {
    code: 'green02',
    name: '업사이클 선반',
    description: '재활용 원목으로 제작된 벽 선반',
    price: 150,
    category: FurnitureCategory.STORAGE,
    zIndex: 6,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green02.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green02.png',
  },
  {
    code: 'green03',
    name: '커플 에코인형',
    description: '폐섬유로 만든 커플 토끼&곰 인형 세트',
    price: 80,
    category: FurnitureCategory.DECOR,
    zIndex: 11,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green03.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green03.png',
  },
  {
    code: 'green04',
    name: '제로웨이스트 달력',
    description: '종이 절약형 1장짜리 달력',
    price: 60,
    category: FurnitureCategory.DECOR,
    zIndex: 16,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green04.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green04.png',
  },
  {
    code: 'green05',
    name: '허브 창문',
    description: '자연광과 허브가 함께하는 창문 구조',
    price: 200,
    category: FurnitureCategory.WINDOW,
    zIndex: 21,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green05.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green05.png',
  },
  {
    code: 'green06',
    name: '에코 러그',
    description: '폐플라스틱 섬유로 만든 따뜻한 러그',
    price: 120,
    category: FurnitureCategory.FABRIC,
    zIndex: 26,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green06.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green06.png',
  },
  {
    code: 'green07',
    name: '친환경 쿠션',
    description: '옥수수 섬유 충전재로 만든 쿠션',
    price: 90,
    category: FurnitureCategory.FABRIC,
    zIndex: 31,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green07.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green07.png',
  },
  {
    code: 'green08',
    name: '중고 동화책',
    description: '재사용된 그림책, 감성 업사이클 아이템',
    price: 50,
    category: FurnitureCategory.DECOR,
    zIndex: 36,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green08.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green08.png',
  },
  {
    code: 'green09',
    name: '리사이클 침대',
    description: '폐목재 프레임과 친환경 이불 세트',
    price: 500,
    category: FurnitureCategory.BED,
    zIndex: 41,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green09.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green09.png',
  },
  {
    code: 'green10',
    name: '태양광 스탠드',
    description: '태양광 충전으로 작동하는 미니 램프',
    price: 250,
    category: FurnitureCategory.LIGHTING,
    zIndex: 46,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green10.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green10.png',
  },
  {
    code: 'green11',
    name: '에코 캠핑 침낭',
    description: '리사이클 섬유로 제작된 그린 침낭',
    price: 120,
    category: FurnitureCategory.BED,
    zIndex: 51,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green11.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green11.png',
  },
  {
    code: 'green12',
    name: '업사이클 책상',
    description: '분리수거된 자재로 제작한 친환경 책상',
    price: 300,
    category: FurnitureCategory.DESK,
    zIndex: 56,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green12.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green12.png',
  },
  {
    code: 'green13',
    name: '리페어 의자',
    description: '오래된 의자를 수선해 만든 빈티지 의자',
    price: 100,
    category: FurnitureCategory.CHAIR,
    zIndex: 61,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green13.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green13.png',
  },
  {
    code: 'green14',
    name: '나무고양이 액자',
    description: '식물성 잉크로 인쇄된 고양이 그림 액자',
    price: 70,
    category: FurnitureCategory.DECOR,
    zIndex: 66,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green14.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green14.png',
  },
  {
    code: 'green15',
    name: '플래닛 조명',
    description: '달과 지구를 본뜬 무드등, 충전식',
    price: 200,
    category: FurnitureCategory.LIGHTING,
    zIndex: 71,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/green15.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/green15.png',
  },
];
