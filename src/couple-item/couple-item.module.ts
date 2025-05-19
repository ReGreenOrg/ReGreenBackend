import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleItem } from './entities/couple-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoupleItem])],
})
export class CoupleItemModule {}
