import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('couples')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.COUPLE)
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('code')
  async createCode(@Req() req) {
    const code = await this.coupleService.generateCode(req.user.memberId);
    return { code };
  }

  @Post('join')
  async joinCouple(@Req() req, @Body('code') code: string) {
    const couple = await this.coupleService.joinWithCode(
      req.user.memberId,
      code,
    );
    return { coupleId: couple.id };
  }

  @Get('my')
  async getMyCouple(@Req() req) {
    const couple = await this.coupleService.findByMember(req.user.memberId);
    return { couple };
  }
}
