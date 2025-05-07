import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberDto } from './dto/member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async createMember(createMemberDto: MemberDto): Promise<Member> {
    const newMember = this.memberRepository.create(createMemberDto);
    await this.memberRepository.save(newMember);
    return newMember;
  }

  async getMemberById(id: number): Promise<MemberDto> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return {
      email: member.email,
      memberId: member.id,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl
    };
  }

  async getMemberByEmail(email: string): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ email });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }
}
