import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { Couple } from '../couple/entities/couple.entity';
import { UpdateMemberDto } from './dto/update-member.dto';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async findByEmail(email: string): Promise<Member | null> {
    return await this.memberRepo.findOne({
      where: { email },
    });
  }

  async findById(memberId: string): Promise<Member | null> {
    return await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['couple'],
    });
  }

  async findByIdOrThrowException(memberId: string): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async findCoupleByMember(memberId: string): Promise<Couple | null> {
    const member = await this.findByIdOrThrowException(memberId);
    return member.couple ? member.couple : null;
  }

  async editMe(memberId: string, dto: UpdateMemberDto) {
    const member = await this.findByIdOrThrowException(memberId);
    Object.assign(member, dto);
    await this.memberRepo.save(member);
  }

  async save(member: Member): Promise<Member> {
    return await this.memberRepo.save(member);
  }

  async createAndSave(dto: CreateMemberDto) {
    const newMember = this.memberRepo.create({
      ...dto,
    });
    return await this.save(newMember);
  }
}
