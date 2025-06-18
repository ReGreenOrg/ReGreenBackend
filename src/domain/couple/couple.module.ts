import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from './entities/couple.entity';
import { RedisModule } from '../../common/redis/redis.module';
import { CoupleItem } from './entities/couple-item.entity';
import { MemberModule } from '../member/member.module';
import { S3Module } from '../../common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Couple, CoupleItem]),
    MemberModule,
    RedisModule,
    S3Module,
  ],
  controllers: [CoupleController],
  providers: [CoupleService],
  exports: [CoupleService],
})
export class CoupleModule {}
