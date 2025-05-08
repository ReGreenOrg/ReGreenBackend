import { Test, TestingModule } from '@nestjs/testing';
import { EcoVerificationService } from '../eco-verification/eco-verification.service';

describe('EcoVerificationService', () => {
  let service: EcoVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EcoVerificationService],
    }).compile();

    service = module.get<EcoVerificationService>(EcoVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
