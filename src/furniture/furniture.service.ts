import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FurnitureService {
  constructor(
    @InjectRepository(Furniture)
    private readonly furnitureRepo: Repository<Furniture>,
  ) {}
}
