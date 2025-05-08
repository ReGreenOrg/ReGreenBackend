import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoupleFurniture } from './entities/couple-furniture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoupleFurnitureService {
  constructor(
    @InjectRepository(CoupleFurniture)
    private readonly coupleFurnitureRepo: Repository<CoupleFurniture>,
  ) {}
}
