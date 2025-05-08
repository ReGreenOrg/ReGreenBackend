import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';

@Injectable()
export class CoupleService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepo: Repository<Couple>,
  ) {}
}
