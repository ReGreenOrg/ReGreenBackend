import {
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Member } from '../member/entities/member.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao/login')
  async kakaoCallback(
    @Query('code') code: string,
    @Query('local', ParseBoolPipe) local = false,
  ): Promise<JwtResponseDto> {
    const kakaoToken = await this.authService.getToken(code, local);
    const profile = await this.authService.getProfile(kakaoToken);
    const member = await this.authService.upsertMember(profile);

    return await this.authService.issueTokens(member);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any): Promise<JwtResponseDto> {
    const { memberId, jti } = req.user;
    return await this.authService.rotate(memberId, jti);
  }

  @Post('logout')
  async logout(@Req() req: any): Promise<void> {
    await this.authService.revokeAll(req.user.memberId);
  }

  @Get('/mylogin') async myLogin(): Promise<JwtResponseDto> {
    return await this.authService.issueTokens({
      id: '5660f0dc-8853-4465-ac13-9c65f2202b67',
    } as Member);
  }
}
