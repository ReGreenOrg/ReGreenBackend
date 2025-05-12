import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FurnitureService } from './furniture.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { FurnitureDto } from './dto/furniture.dto';

@Controller('furniture')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.FURNITURE)
export class FurnitureController {
  constructor(private readonly furnitureService: FurnitureService) {}

  @Get()
  async list(@Req() req): Promise<FurnitureDto[]> {
    return await this.furnitureService.getAll(req.user.memberId);
  }

  @Get(':furnitureId')
  async one(
    @Req() req,
    @Param('furnitureId') furnitureId: string,
  ): Promise<FurnitureDto> {
    return await this.furnitureService.getOne(req.user.memberId, furnitureId);
  }
}
