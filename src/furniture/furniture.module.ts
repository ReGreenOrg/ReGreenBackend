import { Module } from '@nestjs/common';
import { FurnitureService } from './furniture.service';
import { FurnitureController } from './furniture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { FurnitureSeedService } from './constant/furniture-seed-service';
import { MemberModule } from '../member/member.module';
import { CoupleFurnitureModule } from '../couple-furniture/couple-furniture.module';
import { CoupleModule } from '../couple/couple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Furniture]),
    MemberModule,
    CoupleFurnitureModule,
    CoupleModule,
  ],
  controllers: [FurnitureController],
  providers: [FurnitureService, FurnitureSeedService],
  exports: [FurnitureSeedService],
})
export class FurnitureModule {}
