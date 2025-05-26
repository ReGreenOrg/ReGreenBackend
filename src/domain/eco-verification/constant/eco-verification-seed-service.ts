import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EcoVerification } from '../entities/eco-verification.entity';
import { ECO_VERIFICATION_SEEDS } from './eco-verification-seed-data';

@Injectable()
export class EcoVerificationSeedService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
  ) {}

  async sync() {
    await this.ecoVerificationRepo
      .createQueryBuilder()
      .insert()
      .into(EcoVerification)
      .values(ECO_VERIFICATION_SEEDS)
      .orUpdate(
        ['title', 'ecoLovePoint', 'breakupBufferPoint', 'iconImageUrl', 'type'],
        ['code'],
      )
      .execute();

    await this.ecoVerificationRepo
      .createQueryBuilder()
      .delete()
      .where('code NOT IN (:...codes)', {
        codes: ECO_VERIFICATION_SEEDS.map((eco) => eco.code),
      })
      .execute();
  }
}
