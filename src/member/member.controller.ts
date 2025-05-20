import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberDto } from './dto/member.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
@UseGuards(JwtAccessGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('my')
  async getMe(@Req() req): Promise<MemberDto> {
    return await this.memberService.findMemberById(req.user.memberId);
  }

  @Patch('my')
  async editMe(@Req() req: any, @Body() dto: UpdateMemberDto) {
    return await this.memberService.editMe(req.user.memberId, dto);
  }
}
