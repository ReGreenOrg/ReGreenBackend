import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { CoupleModule } from '../couple/couple.module';
import { EcoVerificationModule } from '../eco-verification/eco-verification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    CoupleModule,
    EcoVerificationModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
