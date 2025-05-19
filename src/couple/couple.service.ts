import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { Member } from '../member/entities/member.entity';
import { RedisService } from '../redis/redis.service';
import { CoupleDto } from './dto/couple.dto';
import { MemberEcoVerification } from '../member-eco-verification/entities/member-eco-verification.entity';
import { Item } from '../item/entities/item.entity';
import { CoupleItem } from '../couple-item/entities/couple-item.entity';

@Injectable()
export class CoupleService {
  private readonly REDIS_KEY_PREFIX = 'couple-code:';

  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
    @InjectRepository(Member) private memberRepo: Repository<Member>,
    private dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async generateCode(issuerId: string): Promise<string> {
    const issuer = await this.memberRepo.findOne({
      where: { id: issuerId },
      relations: { couple: true },
    });
    if (!issuer) throw new NotFoundException('Member(Issuer) not found.');
    if (issuer.couple)
      throw new ConflictException('Already in a couple; cannot issue a code.');

    const code = (Math.random() * 36 ** 6)
      .toString(36)
      .slice(0, 6)
      .toUpperCase();
    await this.redisService.set(this.REDIS_KEY_PREFIX + code, issuerId, {
      ttl: 3600 * 24,
    }); // 24시간 TTL
    return code;
  }

  async getIssuerNickname(code: string) {
    const key = this.REDIS_KEY_PREFIX + code;
    const issuerId = await this.redisService.get<string>(key);
    if (!issuerId) {
      throw new NotFoundException(`Invalid or expired couple code: ${code}`);
    }

    const issuer = await this.memberRepo.findOne({ where: { id: issuerId } });
    if (!issuer) {
      await this.redisService.del(key);
      throw new NotFoundException('Member(Issuer) not found.');
    }
    return {
      nickname: issuer.nickname,
    };
  }

  async joinWithCode(joinerId: string, code: string): Promise<Couple> {
    const key = this.REDIS_KEY_PREFIX + code;
    const issuerId = await this.redisService.get<string>(key);

    if (!issuerId) {
      throw new BadRequestException(`Invalid or expired couple code: ${code}`);
    }
    if (issuerId === joinerId) {
      throw new BadRequestException('You cannot use your own code.');
    }

    return this.dataSource.transaction(async (manager) => {
      const memberManager = manager.getRepository(Member);
      const coupleManager = manager.getRepository(Couple);
      const itemManager = manager.getRepository(Item);
      const coupleItemManager = manager.getRepository(CoupleItem);

      const issuer = await memberManager.findOne({
        where: { id: issuerId },
        relations: { couple: true },
        lock: { mode: 'pessimistic_write' },
      });
      const joiner = await memberManager.findOne({
        where: { id: joinerId },
        relations: { couple: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!issuer || !joiner) {
        throw new BadRequestException('Member(Issuer or Joiner) not found.');
      }

      if (joiner.couple) {
        throw new ConflictException('Already in a couple; cannot join.');
      }

      let couple = issuer.couple;
      if (!couple) {
        couple = coupleManager.create();
        await coupleManager.save(couple);
        issuer.couple = couple;
        await memberManager.save(issuer);

        const defaultItemCodes = ['20250524-00', '20250524-01'];
        const defaultItems = await itemManager.find({
          where: { code: In(defaultItemCodes) },
        });
        if (!defaultItems.length) {
          throw new InternalServerErrorException(
            'Default item information not found.',
          );
        }

        const defaultCoupleItems = defaultItems.map((item) =>
          coupleItemManager.create({
            couple: couple!,
            item: item,
            isPlaced: true,
          }),
        );
        await coupleItemManager.save(defaultCoupleItems);
      }

      joiner.couple = couple;
      await memberManager.save(joiner);

      await this.redisService.del(this.REDIS_KEY_PREFIX + code);

      return couple;
    });
  }

  async findByMember(memberId: string): Promise<CoupleDto | null> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      select: { id: true },
      relations: { couple: true },
    });

    if (!member?.couple) {
      return null;
    }

    const couple = await this.coupleRepo.findOne({
      where: { id: member.couple.id },
      relations: ['members'],
    });

    if (!couple) {
      return null;
    }

    return {
      coupleId: couple.id,
      point: couple.ecoLovePoint,
      breakupPoint: couple.breakupBufferPoint,
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
