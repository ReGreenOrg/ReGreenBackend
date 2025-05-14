import { Test, TestingModule } from '@nestjs/testing';
import { MemberEcoVerificationController } from '../member-eco-verification/member-eco-verification.controller';
import { MemberEcoVerificationService } from '../member-eco-verification/member-eco-verification.service';

describe('MemberEcoVerificationController', () => {
  let controller: MemberEcoVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberEcoVerificationController],
      providers: [MemberEcoVerificationService],
    }).compile();

    controller = module.get<MemberEcoVerificationController>(MemberEcoVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
