import { Module } from '@nestjs/common';
import { CoupleFurnitureService } from './couple-furniture.service';
import { CoupleFurnitureController } from './couple-furniture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleFurniture } from './entities/couple-furniture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoupleFurniture])],
  controllers: [CoupleFurnitureController],
  providers: [CoupleFurnitureService],
})
export class CoupleFurnitureModule {}
