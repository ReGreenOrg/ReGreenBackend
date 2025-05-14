import { Test, TestingModule } from '@nestjs/testing';
import { MemberEcoVerificationService } from '../member-eco-verification/member-eco-verification.service';

describe('MemberEcoVerificationService', () => {
  let service: MemberEcoVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberEcoVerificationService],
    }).compile();

    service = module.get<MemberEcoVerificationService>(MemberEcoVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
