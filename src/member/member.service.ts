import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberDto } from './dto/member.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { DataSource, Repository } from 'typeorm';
import { Couple } from '../couple/entities/couple.entity';
import { EcoVerification } from '../eco-verification/entities/eco-verification.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createMember(createMemberDto: MemberDto): Promise<Member> {
    const newMember = this.memberRepo.create(createMemberDto);
    await this.memberRepo.save(newMember);
    return newMember;
  }

  async getMemberById(memberId: string): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: { couple: true, ecoVerificationLinks: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
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

  async getMemberByEmail(email: string): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: { email },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
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

  async remove(memberId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const member = await manager.findOne(Member, {
        where: { id: memberId },
        relations: ['couple', 'ecoVerifications'],
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      const coupleId = member.couple?.id;
      // If part of a couple, delete the couple entity first
      if (coupleId) {
        await manager.delete(Couple, { id: coupleId });

        await manager
          .createQueryBuilder()
          .update(Member)
          .set({ couple: null })
          .where('id = :coupleId', { coupleId: coupleId })
          .execute();
      }

      if (member.ecoVerificationLinks?.length) {
        await manager.delete(EcoVerification, { member: { id: memberId } });
      }

      await manager.delete(Member, { id: memberId });
    });
  }
}
