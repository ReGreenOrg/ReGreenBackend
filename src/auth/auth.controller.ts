import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DomainCode } from '../common/constant/domain-code.constant';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { StateService } from './state.service';

@Controller('auth')
@ApiDomain(DomainCode.AUTH)
export class AuthController {
  constructor(
    private readonly cs: ConfigService,
    private readonly auth: AuthService,
    private readonly stateService: StateService,
  ) {}

  @Get('kakao/login')
  async kakaoRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const clientId = this.cs.get<string>('KAKAO_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.cs.get<string>('KAKAO_REDIRECT_URI')!,
    );

    const origin =
      (req.headers['origin'] as string | undefined) ??
      (req.headers['referer']
        ? new URL(req.headers['referer'] as string).origin
        : undefined) ??
      this.cs.get('FRONT_URL')!;

    const state = this.stateService.make(origin);

    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}`;

    return res.redirect(kakaoAuthUrl);
  }

  @Get('kakao')
  async kakaoCallback(
    @Req() req: Request,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    const kakaoToken = await this.auth.getToken(code);
    const profile = await this.auth.getProfile(kakaoToken);
    const member = await this.auth.upsertMember(profile);

    const { accessToken, refreshToken } = await this.auth.issueTokens(member);

    const domain = this.stateService.parse(state).returnUrl;
    const local = domain === 'http://localhost:3000';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: !local,
      sameSite: 'none',
      maxAge: 15 * 60 * 1e3,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: local,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1e3,
    });

    console.log(`${this.stateService.parse(state).returnUrl}`);
    return res.redirect(`${this.stateService.parse(state).returnUrl}/login`);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: any, @Res() res: Response) {
    const { memberId, jti } = req.user;
    const { accessToken, refreshToken } = await this.auth.rotate(memberId, jti);

    const origin =
      (req.headers['origin'] as string | undefined) ??
      (req.headers['referer']
        ? new URL(req.headers['referer'] as string).origin
        : undefined) ??
      this.cs.get('FRONT_URL')!;

    const local = origin === 'http://localhost:3000';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: !local,
      sameSite: 'none',
      maxAge: 15 * 60 * 1e3,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: !local,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1e3,
    });

    return res.json({
      code: 2100,
      message: 'OK',
      data: { message: 'refreshed' },
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-access'))
  async logout(@Req() req: any, @Res() res: Response) {
    await this.auth.revokeAll(req.user.memberId);
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return res.json({
      code: 2100,
      message: 'OK',
      data: { message: 'Logged out' },
    });
  }
}
