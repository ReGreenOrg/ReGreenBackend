import { Test, TestingModule } from '@nestjs/testing';
import { FurnitureController } from '../furniture/furniture.controller';
import { FurnitureService } from '../furniture/furniture.service';

describe('FurnitureController', () => {
  let controller: FurnitureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FurnitureController],
      providers: [FurnitureService],
    }).compile();

    controller = module.get<FurnitureController>(FurnitureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
