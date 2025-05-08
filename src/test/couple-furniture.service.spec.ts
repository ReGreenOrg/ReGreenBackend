import { Test, TestingModule } from '@nestjs/testing';
import { CoupleFurnitureService } from '../couple-furniture/couple-furniture.service';

describe('CoupleFurnitureService', () => {
  let service: CoupleFurnitureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoupleFurnitureService],
    }).compile();

    service = module.get<CoupleFurnitureService>(CoupleFurnitureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
