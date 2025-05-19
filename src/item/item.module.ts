import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item-controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemSeedService } from './constant/item-seed.service';
import { MemberModule } from '../member/member.module';
import { CoupleItemModule } from '../couple-item/couple-item.module';
import { CoupleModule } from '../couple/couple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    MemberModule,
    CoupleItemModule,
    CoupleModule,
  ],
  controllers: [ItemController],
  providers: [ItemService, ItemSeedService],
  exports: [ItemSeedService],
})
export class ItemModule {}
