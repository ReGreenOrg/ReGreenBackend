import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberDto } from './dto/member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async createMember(createMemberDto: MemberDto): Promise<Member> {
    const newMember = this.memberRepo.create(createMemberDto);
    await this.memberRepo.save(newMember);
    return newMember;
  }

  async getMemberById(id: string): Promise<MemberDto> {
    const member = await this.memberRepo.findOneBy({ id });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return {
      email: member.email,
      memberId: member.id,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
    };
  }

  async getMemberByEmail(email: string): Promise<Member> {
    const member = await this.memberRepo.findOneBy({ email });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }
}
