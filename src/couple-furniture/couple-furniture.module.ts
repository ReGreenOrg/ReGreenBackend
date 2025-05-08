import { Module } from '@nestjs/common';
import { CoupleFurnitureService } from './couple-furniture.service';
import { CoupleFurnitureController } from './couple-furniture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleFurniture } from './entities/couple-furniture.entity';
import { CoupleModule } from '../couple/couple.module';
import { FurnitureModule } from '../furniture/furniture.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoupleFurniture]),
    CoupleModule,
    FurnitureModule,
  ],
  controllers: [CoupleFurnitureController],
  providers: [CoupleFurnitureService],
})
export class CoupleFurnitureModule {}
