import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { MemberDto } from './dto/member.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('members')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.MEMBER)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('my')
  async getMe(@Req() req): Promise<MemberDto> {
    return await this.memberService.findMemberById(req.user.memberId);
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteUser(@Req() req: any) {
    await this.memberService.remove(req.user.memberId);
  }
}
