import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEcoVerification } from './entities/member-eco-verification.entity';
import { Member } from './entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberEcoVerification])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
