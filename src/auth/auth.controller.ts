import {
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Member } from '../member/entities/member.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cs: ConfigService,
    private readonly auth: AuthService,
  ) {}

  @Post('kakao/login')
  async kakaoCallback(
    @Query('code') code: string,
    @Query('local', ParseBoolPipe) local = false,
  ): Promise<JwtResponseDto> {
    const kakaoToken = await this.auth.getToken(code, local);
    const profile = await this.auth.getProfile(kakaoToken);
    const member = await this.auth.upsertMember(profile);

    return await this.auth.issueTokens(member);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any) {
    const { memberId, jti } = req.user;
    return await this.auth.rotate(memberId, jti);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  async logout(@Req() req: any) {
    await this.auth.revokeAll(req.user.memberId);
  }

  @Get('/mylogin') async myLogin(): Promise<JwtResponseDto> {
    return await this.auth.issueTokens({
      id: '5660f0dc-8853-4465-ac13-9c65f2202b67',
    } as Member);
  }
}
