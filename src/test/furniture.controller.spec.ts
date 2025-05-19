import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from '../item/item-controller';
import { ItemService } from '../item/item.service';

describe('FurnitureController', () => {
  let controller: ItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [ItemService],
    }).compile();

    controller = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
