import { Controller, UseGuards } from '@nestjs/common';
import { CoupleFurnitureService } from './couple-furniture.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('couple-furniture')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.COUPLE_FURNITURE)
export class CoupleFurnitureController {
  constructor(
    private readonly coupleFurnitureService: CoupleFurnitureService,
  ) {}
}
