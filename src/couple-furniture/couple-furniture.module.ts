import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleFurniture } from './entities/couple-furniture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoupleFurniture])],
})
export class CoupleFurnitureModule {}
