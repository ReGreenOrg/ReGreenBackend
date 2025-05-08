import { Controller, UseGuards } from '@nestjs/common';
import { CoupleFurnitureService } from './couple-furniture.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { AuthGuard } from '@nestjs/passport';

@Controller('couple-furniture')
@UseGuards(AuthGuard('jwt'))
@ApiDomain(DomainCode.COUPLE_FURNITURE)
export class CoupleFurnitureController {
  constructor(
    private readonly coupleFurnitureService: CoupleFurnitureService,
  ) {}
}
