import { Test, TestingModule } from '@nestjs/testing';
import { CoupleFurnitureController } from '../couple-furniture/couple-furniture.controller';
import { CoupleFurnitureService } from '../couple-furniture/couple-furniture.service';

describe('CoupleFurnitureController', () => {
  let controller: CoupleFurnitureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoupleFurnitureController],
      providers: [CoupleFurnitureService],
    }).compile();

    controller = module.get<CoupleFurnitureController>(CoupleFurnitureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
