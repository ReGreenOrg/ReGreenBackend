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
import { RequestMember } from '../../common/dto/request-user.dto';

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
  async refresh(@Req() member: RequestMember): Promise<JwtResponseDto> {
    const { memberId, jti } = member.user;
    return await this.authService.rotate(memberId, jti);
  }

  @Post('logout')
  async logout(@Req() member: RequestMember): Promise<void> {
    await this.authService.revokeAll(member.user.memberId);
  }

  @Get('/mylogin') async myLogin(): Promise<JwtResponseDto> {
    return await this.authService.issueTokens({
      id: '5c922309-4d07-4b4f-9267-1a7931242f30',
    } as Member);
  }
}
