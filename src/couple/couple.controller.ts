import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';

@Controller('couples')
@UseGuards(AuthGuard('jwt-access'))
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
