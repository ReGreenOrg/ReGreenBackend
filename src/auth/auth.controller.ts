import {
  Controller,
  Get,
  Header,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DomainCode } from '../common/constant/domain-code.constant';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiDomain(DomainCode.AUTH)
export class AuthController {
  constructor(
    private readonly cs: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('kakao/login')
  @Header('Content-Type', 'text/html')
  async kakaoRedirect(@Res() res: Response): Promise<void> {
    const clientId = this.cs.get<string>('KAKAO_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.cs.get<string>('KAKAO_REDIRECT_URI')!,
    );
    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}`;

    return res.redirect(kakaoAuthUrl);
  }

  @Get('kakao')
  async kakaoCallback(@Query('code') code: string): Promise<JwtResponseDto> {
    const accessToken = await this.authService.getToken(code);
    const profile = await this.authService.getProfile(accessToken);
    const member = await this.authService.upsertMember(profile);
    const jwtToken = await this.authService.issueAccessToken(member.id);
    return { jwtToken };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout() {
    return { message: 'Logged out' };
  }
}
