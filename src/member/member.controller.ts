import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { AuthGuard } from '@nestjs/passport';
import { MemberDto } from './dto/member.dto';

@Controller('members')
@UseGuards(AuthGuard('jwt-access'))
@ApiDomain(DomainCode.MEMBER)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('my')
  async getMe(@Req() req): Promise<MemberDto> {
    return await this.memberService.getMemberById(req.user.memberId);
  }
}
