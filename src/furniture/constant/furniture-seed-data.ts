import { FurnitureCategory } from './furniture-category.enum';
import { DeepPartial } from 'typeorm';
import { Furniture } from '../entities/furniture.entity';

export const FURNITURE_SEEDS: DeepPartial<Furniture>[] = [
  {
    code: '20250524-00',
    name: '기본 바닥재',
    price: 0,
    category: FurnitureCategory.FLOOR,
    zIndex: 0,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-00.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-00.png',
  },
  {
    code: '20250524-01',
    name: '기본 벽지',
    price: 0,
    category: FurnitureCategory.WALL_PAPER,
    zIndex: 5,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-01.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-01.png',
  },
  {
    code: '20250524-02',
    name: '에코 벽지',
    price: 5,
    category: FurnitureCategory.WALL_PAPER,
    zIndex: 10,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-02.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-02.png',
  },
  {
    code: '20250524-03',
    name: '에코 선반 세트',
    price: 150,
    category: FurnitureCategory.FURNITURE,
    zIndex: 15,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-03.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-03.png',
  },
  {
    code: '20250524-04',
    name: '에코 캘린더',
    price: 80,
    category: FurnitureCategory.PROP,
    zIndex: 20,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-04.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-04.png',
  },
  {
    code: '20250524-05',
    name: '에코 창문',
    price: 60,
    category: FurnitureCategory.WINDOW,
    zIndex: 25,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-05.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-05.png',
  },
  {
    code: '20250524-06',
    name: '에코 러그',
    price: 200,
    category: FurnitureCategory.PROP,
    zIndex: 30,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-06.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-06.png',
  },
  {
    code: '20250524-07',
    name: '에코 쿠션',
    price: 120,
    category: FurnitureCategory.PROP,
    zIndex: 35,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-07.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-07.png',
  },
  {
    code: '20250524-08',
    name: '에코 동화책',
    price: 90,
    category: FurnitureCategory.PROP,
    zIndex: 40,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-08.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-08.png',
  },
  {
    code: '20250524-09',
    name: '에코 침대',
    price: 50,
    category: FurnitureCategory.FURNITURE,
    zIndex: 45,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-09.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-09.png',
  },
  {
    code: '20250524-10',
    name: '에코 스탠드',
    price: 500,
    category: FurnitureCategory.PROP,
    zIndex: 50,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-10.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-10.png',
  },
  {
    code: '20250524-11',
    name: '에코 가방',
    price: 250,
    category: FurnitureCategory.PROP,
    zIndex: 55,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-11.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-11.png',
  },
  {
    code: '20250524-12',
    name: '에코 책상 세트',
    price: 300,
    category: FurnitureCategory.FURNITURE,
    zIndex: 60,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-12.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-12.png',
  },
  {
    code: '20250524-13',
    name: '에코 의자',
    price: 100,
    category: FurnitureCategory.FURNITURE,
    zIndex: 65,
    s3ImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-13.png',
    s3PreviewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-13.png',
  },
];
