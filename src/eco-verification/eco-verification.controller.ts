import { Controller, UseGuards } from '@nestjs/common';
import { EcoVerificationService } from './eco-verification.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('eco-verifications')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.ECO_VERIFICATION)
export class EcoVerificationController {
  constructor(
    private readonly ecoVerificationService: EcoVerificationService,
  ) {}
}
