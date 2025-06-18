import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from './entities/couple.entity';
import { RedisModule } from '../../common/redis/redis.module';
import { CoupleItem } from './entities/couple-item.entity';
import { MemberModule } from '../member/member.module';
import { S3Module } from '../../common/s3/s3.module';
import { CouplePhoto } from './entities/couple-photo.entity';
import { CoupleRankingService } from './couple-ranking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Couple, CoupleItem, CouplePhoto]),
    MemberModule,
    RedisModule,
    S3Module,
  ],
  controllers: [CoupleController],
  providers: [CoupleService, CoupleRankingService],
  exports: [CoupleService],
})
export class CoupleModule {}
