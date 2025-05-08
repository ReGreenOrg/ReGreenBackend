import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from './entities/couple.entity';
import { RedisModule } from '../redis/redis.module';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Member]), RedisModule],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
