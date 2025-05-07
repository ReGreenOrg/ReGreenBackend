import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async createMember(createMemberDto: CreateMemberDto): Promise<Member> {
    const newMember = this.memberRepository.create(createMemberDto);
    await this.memberRepository.save(newMember);
    return newMember;
  }

  // async getMemberById(id: string): Promise<Member> {
  //   const member = await this.memberRepository.findOneBy({ id });
  //   if (!member) {
  //     throw new NotFoundException('Member not found');
  //   }
  //   return member;
  // }

  async getMemberByEmail(email: string): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ email });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }
}
