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
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CoupleCodeDto } from './dto/couple-code.dto';
import { CoupleDto } from './dto/couple.dto';
import { RequestMember } from '../../common/dto/request-user.dto';

@Controller('couples')
@UseGuards(JwtAccessGuard)
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Get('code')
  async createCode(@Req() req: RequestMember): Promise<CoupleCodeDto> {
    return await this.coupleService.generateCode(req.user.memberId);
  }

  @Post('join')
  async joinCouple(
    @Req() req: RequestMember,
    @Body() coupleCodeDto: CoupleCodeDto,
  ): Promise<void> {
    await this.coupleService.joinWithCode(
      req.user.memberId,
      coupleCodeDto.code,
    );
  }

  @Get('my')
  async getMyCouple(@Req() req: RequestMember): Promise<CoupleDto | null> {
    return await this.coupleService.findCoupleByMember(req.user.memberId);
  }

  @Delete('my')
  async breakup(@Req() req: RequestMember): Promise<void> {
    await this.coupleService.breakup(req.user.memberId);
  }

  @Get('code/:code/nickname')
  async getIssuerNicknameByCoupleCode(
    @Param('code') code: string,
  ): Promise<{ nickname: string }> {
    return await this.coupleService.getIssuerNickname(code);
  }
}
