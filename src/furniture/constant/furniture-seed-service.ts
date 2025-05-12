import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Furniture } from '../entities/furniture.entity';
import { Repository } from 'typeorm';
import { FURNITURE_SEEDS } from './furniture-seed-data';

@Injectable()
export class FurnitureSeedService {
  constructor(
    @InjectRepository(Furniture)
    private readonly furnitureRepo: Repository<Furniture>,
  ) {}

  async sync() {
    await this.furnitureRepo
      .createQueryBuilder()
      .insert()
      .into(Furniture)
      .values(FURNITURE_SEEDS)
      .orUpdate(
        ['name', 'description', 'price', 'category', 'zIndex', 's3ImageUrl'],
        ['code'],
      )
      .execute();

    await this.furnitureRepo
      .createQueryBuilder()
      .delete()
      .where('code NOT IN (:...codes)', {
        codes: FURNITURE_SEEDS.map((f) => f.code),
      })
      .execute();
  }
}
