import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEcoVerification } from './entities/member-eco-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEcoVerification])],
})
export class MemberEcoVerificationModule {}
