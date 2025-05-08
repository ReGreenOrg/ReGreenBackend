import { Test, TestingModule } from '@nestjs/testing';
import { EcoVerificationController } from '../eco-verification/eco-verification.controller';
import { EcoVerificationService } from '../eco-verification/eco-verification.service';

describe('EcoVerificationController', () => {
  let controller: EcoVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EcoVerificationController],
      providers: [EcoVerificationService],
    }).compile();

    controller = module.get<EcoVerificationController>(EcoVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
