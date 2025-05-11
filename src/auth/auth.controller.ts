import {
  Controller,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainCode } from '../common/constant/domain-code.constant';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtResponseDto } from './dto/jwt-response.dto';

@Controller('auth')
@ApiDomain(DomainCode.AUTH)
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
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: any) {
    const { memberId, jti } = req.user;
    return await this.auth.rotate(memberId, jti);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-access'))
  async logout(@Req() req: any) {
    await this.auth.revokeAll(req.user.memberId);
  }
}
