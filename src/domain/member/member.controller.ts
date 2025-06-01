import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberResponseDto } from './dto/member-response.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RequestMember } from '../../common/dto/request-user.dto';

@Controller('members')
@UseGuards(JwtAccessGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('my')
  async getMe(@Req() req: RequestMember): Promise<MemberResponseDto> {
    const member = await this.memberService.findByIdOrThrowException(
      req.user.memberId,
    );
    return {
      email: member.email,
      memberId: member.id,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      coupleId: member.couple ? member.couple.id : null,
    };
  }

  @Patch('my')
  async editMe(
    @Req() req: RequestMember,
    @Body() dto: UpdateMemberDto,
  ): Promise<void> {
    return await this.memberService.editMe(req.user.memberId, dto);
  }
}
