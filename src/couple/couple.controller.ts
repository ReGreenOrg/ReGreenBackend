import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoupleService } from './couple.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('couples')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.COUPLE)
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Get('code')
  async createCode(@Req() req: any) {
    const code = await this.coupleService.generateCode(req.user.memberId);
    return { code };
  }

  @Post('join')
  async joinCouple(@Req() req: any, @Body('code') code: string) {
    const couple = await this.coupleService.joinWithCode(
      req.user.memberId,
      code,
    );
    return { coupleId: couple.id };
  }

  @Get('my')
  async getMyCouple(@Req() req) {
    return await this.coupleService.findCoupleByMember(req.user.memberId);
  }

  @Delete('my')
  async breakup(@Req() req: any) {
    await this.coupleService.breakup(req.user.memberId);
  }

  @Get('code/:code/nickname')
  async getIssuerNicknameByCoupleCode(@Param('code') code: string) {
    return await this.coupleService.getIssuerNickname(code);
  }
}
