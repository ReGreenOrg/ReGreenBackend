import { Controller, UseGuards } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';

@Controller('couples')
@UseGuards(AuthGuard('jwt'))
@ApiDomain(DomainCode.COUPLE)
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}
}
