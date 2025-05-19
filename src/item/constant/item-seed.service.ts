import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';
import { Repository } from 'typeorm';
import { ITEM_SEEDS } from './item-seed-data';

@Injectable()
export class ItemSeedService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async sync() {
    await this.itemRepo
      .createQueryBuilder()
      .insert()
      .into(Item)
      .values(ITEM_SEEDS)
      .orUpdate(
        [
          'name',
          'price',
          'category',
          'zIndex',
          'imageUrl',
          'previewImageUrl',
        ],
        ['code'],
      )
      .execute();

    await this.itemRepo
      .createQueryBuilder()
      .delete()
      .where('code NOT IN (:...codes)', {
        codes: ITEM_SEEDS.map((item) => item.code),
      })
      .execute();
  }
}
