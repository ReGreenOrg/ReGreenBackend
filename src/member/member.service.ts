import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberDto } from './dto/member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { Couple } from '../couple/entities/couple.entity';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async getMemberById(memberId: string): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: { couple: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found.');
    }
    return member;
  }

  async findMemberById(memberId: string): Promise<MemberDto> {
    const member = await this.getMemberById(memberId);
    return {
      email: member.email,
      memberId: member.id,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      coupleId: member.couple ? member.couple.id : null,
    };
  }

  async findCoupleByMember(memberId: string): Promise<Couple | null> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      select: {
        id: true,
      },
      relations: { couple: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member.couple ? member.couple : null;
  }

  async editMe(memberId: string, dto: UpdateMemberDto) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    Object.assign(member, dto);
    await this.memberRepo.save(member);
  }
}
