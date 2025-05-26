import { Module } from '@nestjs/common';
import { EcoVerificationService } from './eco-verification.service';
import { EcoVerificationController } from './eco-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { S3Module } from '../../common/s3/s3.module';
import { MemberModule } from '../member/member.module';
import { MemberEcoVerification } from '../member/entities/member-eco-verification.entity';
import { CoupleModule } from '../couple/couple.module';
import { EcoVerificationSeedService } from './constant/eco-verification-seed-service';
import { OpenaiModule } from '../../common/openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EcoVerification, MemberEcoVerification]),
    S3Module,
    MemberModule,
    CoupleModule,
    OpenaiModule,
  ],
  controllers: [EcoVerificationController],
  providers: [EcoVerificationService, EcoVerificationSeedService],
  exports: [EcoVerificationService, EcoVerificationSeedService],
})
export class EcoVerificationModule {}
