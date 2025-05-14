import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EcoVerificationService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
  ) {}

  async deleteByMemberId(memberId: string) {
    await this.ecoVerificationRepo.delete({ member: { id: memberId } });
  }
}
