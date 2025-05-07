import { Controller } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';

@Controller('member')
@ApiDomain(DomainCode.MEMBER)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
}
