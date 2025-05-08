import { Controller, UseGuards } from '@nestjs/common';
import { EcoVerificationService } from './eco-verification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';

@Controller('eco-verifications')
@UseGuards(AuthGuard('jwt'))
@ApiDomain(DomainCode.ECO_VERIFICATION)
export class EcoVerificationController {
  constructor(
    private readonly ecoVerificationService: EcoVerificationService,
  ) {}
}
