import { ItemCategory } from './item-category.enum';
import { DeepPartial } from 'typeorm';
import { Item } from '../entities/item.entity';

export const ITEM_SEEDS: DeepPartial<Item>[] = [
  {
    code: '20250524-00',
    name: '기본 바닥재',
    price: 0,
    category: ItemCategory.FLOOR,
    zIndex: 0,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-00.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-00.png',
  },
  {
    code: '20250524-01',
    name: '기본 벽지',
    price: 0,
    category: ItemCategory.WALL_PAPER,
    zIndex: 5,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-01.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-01.png',
  },
  {
    code: '20250524-02',
    name: '에코 벽지',
    price: 5,
    category: ItemCategory.WALL_PAPER,
    zIndex: 10,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-02.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-02.png',
  },
  {
    code: '20250524-03',
    name: '에코 선반 세트',
    price: 150,
    category: ItemCategory.FURNITURE,
    zIndex: 15,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-03.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-03.png',
  },
  {
    code: '20250524-04',
    name: '에코 캘린더',
    price: 80,
    category: ItemCategory.PROP,
    zIndex: 20,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-04.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-04.png',
  },
  {
    code: '20250524-05',
    name: '에코 창문',
    price: 60,
    category: ItemCategory.WINDOW,
    zIndex: 25,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-05.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-05.png',
  },
  {
    code: '20250524-06',
    name: '에코 러그',
    price: 200,
    category: ItemCategory.PROP,
    zIndex: 30,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-06.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-06.png',
  },
  {
    code: '20250524-07',
    name: '에코 쿠션',
    price: 120,
    category: ItemCategory.PROP,
    zIndex: 35,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-07.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-07.png',
  },
  {
    code: '20250524-08',
    name: '에코 동화책',
    price: 90,
    category: ItemCategory.PROP,
    zIndex: 40,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-08.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-08.png',
  },
  {
    code: '20250524-09',
    name: '에코 침대',
    price: 50,
    category: ItemCategory.FURNITURE,
    zIndex: 45,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-09.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-09.png',
  },
  {
    code: '20250524-10',
    name: '에코 스탠드',
    price: 500,
    category: ItemCategory.PROP,
    zIndex: 50,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-10.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-10.png',
  },
  {
    code: '20250524-11',
    name: '에코 가방',
    price: 250,
    category: ItemCategory.PROP,
    zIndex: 55,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-11.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-11.png',
  },
  {
    code: '20250524-12',
    name: '에코 책상 세트',
    price: 300,
    category: ItemCategory.FURNITURE,
    zIndex: 60,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-12.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-12.png',
  },
  {
    code: '20250524-13',
    name: '에코 의자',
    price: 100,
    category: ItemCategory.FURNITURE,
    zIndex: 65,
    imageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/20250524-13.png',
    previewImageUrl:
      'https://regreen-bucket.s3.ap-northeast-2.amazonaws.com/images/constant/furniture/preview/20250524-13.png',
  },
];
