import { PartialType } from '@nestjs/mapped-types';
import { MemberDto } from './member.dto';

export class UpdateMemberDto extends PartialType(MemberDto) {}
