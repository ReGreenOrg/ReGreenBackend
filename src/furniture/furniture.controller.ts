import { Controller, UseGuards } from '@nestjs/common';
import { FurnitureService } from './furniture.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';

@Controller('furniture')
@UseGuards(AuthGuard('jwt'))
@ApiDomain(DomainCode.FURNITURE)
export class FurnitureController {
  constructor(private readonly furnitureService: FurnitureService) {}
}
