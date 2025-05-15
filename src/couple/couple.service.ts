import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { Member } from '../member/entities/member.entity';
import { RedisService } from '../redis/redis.service';
import { CoupleDto } from './dto/couple.dto';
import { MemberEcoVerification } from '../member-eco-verification/entities/member-eco-verification.entity';

@Injectable()
export class CoupleService {
  private readonly CODE_PREFIX = 'couple-code:'; // Redis key

  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
    @InjectRepository(Member) private memberRepo: Repository<Member>,
    private dataSource: DataSource,
    private readonly redis: RedisService,
  ) {}

  async generateCode(issuerId: string): Promise<string> {
    const issuer = await this.memberRepo.findOne({
      where: { id: issuerId },
      relations: { couple: true },
    });

    if (!issuer) throw new BadRequestException('존재하지 않는 회원');
    if (issuer.couple)
      throw new ConflictException(
        '이미 커플에 속해 있어 코드를 발급할 수 없습니다.',
      );

    const code = (Math.random() * 36 ** 6)
      .toString(36)
      .slice(0, 6)
      .toUpperCase();

    await this.redis.set(this.CODE_PREFIX + code, issuerId, { ttl: 3600 * 24 }); // 24시간 TTL
    return code;
  }

  async getIssuerNickname(code: string) {
    const key = this.CODE_PREFIX + code;
    const issuerId = await this.redis.get<string>(key);
    if (!issuerId) {
      throw new NotFoundException('유효하지 않거나 만료된 코드입니다.');
    }

    const member = await this.memberRepo.findOne({ where: { id: issuerId } });
    if (!member) {
      await this.redis.del(key);
      throw new NotFoundException('발급자를 찾을 수 없습니다.');
    }
    return {
      nickname: member.nickname,
    };
  }

  async joinWithCode(joinerId: string, code: string): Promise<Couple> {
    const issuerId: string | undefined = await this.redis.get(
      this.CODE_PREFIX + code,
    );
    if (!issuerId) throw new BadRequestException('유효하지 않거나 만료된 코드');

    if (issuerId === joinerId)
      throw new BadRequestException('본인 코드를 사용할 수 없습니다.');

    return this.dataSource.transaction(async (manager) => {
      const membersRepo = manager.getRepository(Member);
      const couplesRepo = manager.getRepository(Couple);

      const issuer = await membersRepo.findOne({
        where: { id: issuerId },
        relations: { couple: true },
        lock: { mode: 'pessimistic_write' },
      });
      const joiner = await membersRepo.findOne({
        where: { id: joinerId },
        relations: { couple: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!issuer || !joiner)
        throw new BadRequestException('존재하지 않는 회원');

      if (joiner.couple)
        throw new ConflictException(
          '이미 커플에 속해 있어 가입할 수 없습니다.',
        );

      let couple = issuer.couple;
      if (!couple) {
        couple = couplesRepo.create();
        await couplesRepo.save(couple);
        issuer.couple = couple;
        await membersRepo.save(issuer);
      }

      joiner.couple = couple;
      await membersRepo.save(joiner);

      await this.redis.del(this.CODE_PREFIX + code);

      return couple;
    });
  }

  async findByMember(memberId: string): Promise<CoupleDto | null> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      select: { id: true },
      relations: { couple: true },
    });

    if (!member?.couple) return null;

    const couple = await this.coupleRepo.findOne({
      where: { id: member.couple.id },
      relations: ['members'],
    });

    if (!couple) return null;

    return {
      coupleId: couple.id,
      point: couple.point,
      breakupAt: couple.breakupAt,
      members: couple.members.map((m) => ({
        memberId: m.id,
        nickname: m.nickname,
        profileImageUrl: m.profileImageUrl ?? null,
      })),
    };
  }

  async breakup(memberId: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['couple'],
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const coupleId = member.couple?.id;
    if (!coupleId) {
      throw new BadRequestException('Member is not in a couple');
    }

    const coupleWithMembers = await this.coupleRepo.findOne({
      where: { id: coupleId },
      relations: ['members'],
    });

    if (!coupleWithMembers || coupleWithMembers.members.length === 0) {
      throw new BadRequestException('Couple membership is invalid');
    }
    const memberIds = coupleWithMembers.members.map((m) => m.id);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(MemberEcoVerification, {
        member: { id: In(memberIds) },
      });

      await manager.delete(Couple, { id: coupleId });

      await manager.delete(Member, { id: In(memberIds) });
    });
  }
}
