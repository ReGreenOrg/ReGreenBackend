import { Module } from '@nestjs/common';
import { FurnitureService } from './furniture.service';
import { FurnitureController } from './furniture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { FurnitureSeedService } from './constant/furniture-seed-service';
import { CoupleFurniture } from '../couple-furniture/entities/couple-furniture.entity';
import { MemberModule } from '../member/member.module';
import { Couple } from '../couple/entities/couple.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Furniture, CoupleFurniture, Couple]),
    MemberModule,
  ],
  controllers: [FurnitureController],
  providers: [FurnitureService, FurnitureSeedService],
  exports: [FurnitureSeedService],
})
export class FurnitureModule {}
