import { Module } from '@nestjs/common';
import { EcoVerificationService } from './eco-verification.service';
import { EcoVerificationController } from './eco-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [TypeOrmModule.forFeature([EcoVerification]), MemberModule],
  controllers: [EcoVerificationController],
  providers: [EcoVerificationService],
})
export class EcoVerificationModule {}
