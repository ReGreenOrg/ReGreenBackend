import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { Member } from '../member/entities/member.entity';
import { RedisService } from '../../common/redis/redis.service';
import { CoupleDto } from './dto/couple.dto';
import { Item } from '../item/entities/item.entity';
import { CoupleItem } from './entities/couple-item.entity';
import { ErrorType } from '../../common/exception/error-code.enum';
import { BusinessException } from '../../common/exception/business-exception';
import { CoupleCodeDto } from './dto/couple-code.dto';
import { MemberService } from '../member/member.service';
import { tz } from '../../common/utils/date-util';
import * as dayjs from 'dayjs';
import { CouplePhoto } from './entities/couple-photo.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getS3FileInfo } from '../../common/s3/s3.func';
import { IGNORE_COUPLE_IDS } from '../eco-verification/constant/ignore-couple-ids';
import { addDays } from 'date-fns';
import { coupleScoreQB } from './constant/score-query.helper';
import { MemberEcoVerification } from '../member/entities/member-eco-verification.entity';
import * as uuid from 'uuid';

@Injectable()
export class CoupleService {
  private readonly REDIS_KEY_PREFIX = 'couple-code:';

  constructor(
    @InjectRepository(Couple) private coupleRepo: Repository<Couple>,
    @InjectRepository(CouplePhoto)
    private couplePhotoRepo: Repository<CouplePhoto>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly memberService: MemberService,
  ) {}

  async generateCode(issuerId: string): Promise<CoupleCodeDto> {
    const issuer = await this.memberService.findByIdOrThrowException(issuerId);
    if (issuer.couple) {
      throw new BusinessException(ErrorType.ALREADY_IN_COUPLE);
    }

    const code = (Math.random() * 36 ** 6)
      .toString(36)
      .slice(0, 6)
      .toUpperCase();
    await this.redisService.set(this.REDIS_KEY_PREFIX + code, issuerId, {
      ttl: 3600 * 24, // 24h
    });
    return { code };
  }

  async getIssuerNickname(code: string): Promise<{ nickname: string }> {
    const key = this.REDIS_KEY_PREFIX + code;
    const issuerId = await this.redisService.get<string>(key);
    if (!issuerId) {
      throw new BusinessException(ErrorType.INVALID_COUPLE_CODE);
    }

    const issuer = await this.memberService.findById(issuerId);
    if (!issuer) {
      await this.redisService.del(key);
      throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
    }
    return {
      nickname: issuer.nickname,
    };
  }

  async joinWithCode(joinerId: string, code: string): Promise<Couple> {
    const key = this.REDIS_KEY_PREFIX + code;
    const issuerId = await this.redisService.get<string>(key);

    if (!issuerId) {
      throw new BusinessException(ErrorType.INVALID_COUPLE_CODE);
    }
    if (issuerId === joinerId) {
      throw new BusinessException(ErrorType.CANNOT_USE_OWN_COUPLE_CODE);
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
        throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
      }

      if (joiner.couple) {
        throw new BusinessException(ErrorType.ALREADY_IN_COUPLE);
      }

      let couple = issuer.couple;
      if (!couple) {
        const breakupAt = addDays(tz().format(), 14);

        couple = coupleManager.create({ breakupAt });
        await coupleManager.save(couple);
        issuer.couple = couple;
        await memberManager.save(issuer);

        const defaultItemCodes = ['20250524-00', '20250524-01'];
        const defaultItems = await itemManager.find({
          where: { code: In(defaultItemCodes) },
        });
        if (!defaultItems.length) {
          throw new BusinessException(ErrorType.NOT_FOUND_DEFAULT_ITEM);
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

  async joinSoloCouple(realUserId: string): Promise<Couple> {
    return this.dataSource.transaction(async (manager) => {
      const memberManager = manager.getRepository(Member);
      const coupleManager = manager.getRepository(Couple);
      const itemManager = manager.getRepository(Item);
      const coupleItemManager = manager.getRepository(CoupleItem);

      const realMember = await memberManager.findOne({
        where: { id: realUserId },
        relations: { couple: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!realMember) {
        throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
      }
      if (realMember.couple) {
        throw new BusinessException(ErrorType.ALREADY_IN_COUPLE);
      }

      const breakupAt = addDays(tz().format(), 14);
      const couple = coupleManager.create({ breakupAt, isSolo: true });
      await coupleManager.save(couple);

      const fakeMember = memberManager.create({
        nickname: '우이미',
        email: `fake-${uuid.v4()}@fake.com`,
        isFake: true,
        couple: couple,
      });
      await memberManager.save(fakeMember);

      realMember.couple = couple;
      await memberManager.save(realMember);

      const defaultItemCodes = ['20250524-00', '20250524-01'];
      const defaultItems = await itemManager.find({
        where: { code: In(defaultItemCodes) },
      });
      if (!defaultItems.length) {
        throw new BusinessException(ErrorType.NOT_FOUND_DEFAULT_ITEM);
      }

      const defaultCoupleItems = defaultItems.map((item) =>
        coupleItemManager.create({
          couple,
          item,
          isPlaced: true,
        }),
      );
      await coupleItemManager.save(defaultCoupleItems);

      return couple;
    });
  }

  async findByMemberId(memberId: string): Promise<CoupleDto | null> {
    const member = await this.memberService.findByIdOrThrowException(memberId);
    if (!member?.couple) return null;
    const cid = member.couple.id;

    const couple = await this.coupleRepo.findOne({
      where: { id: cid },
      relations: ['members'],
    });
    if (!couple) return null;

    const rankingSub = coupleScoreQB(
      this.coupleRepo.manager.connection,
      { cum: 1, avg: 0.3 },
      IGNORE_COUPLE_IDS,
    );

    const row = await this.coupleRepo.manager
      .createQueryBuilder()
      .select('*')
      .from('(' + rankingSub.getQuery() + ')', 'r')
      .setParameters(rankingSub.getParameters())
      .where('r.coupleId = :cid', { cid })
      .getRawOne<{
        ecoScore: number;
        rank: number;
        cumulativeEcoLovePoints: number;
        ecoVerificationCount: number;
      }>();

    if (!row) return null;

    const remainingDays = Math.max(
      dayjs(couple.breakupAt).diff(dayjs(tz().format('YYYY-MM-DD')), 'day'),
      0,
    );

    return {
      coupleId: couple.id,
      name: couple.name,
      profileImageUrl: couple.profileImageUrl,
      ecoLovePoint: couple.ecoLovePoint,
      breakupBufferPoint: remainingDays,
      cumulativeEcoLovePoints: row.cumulativeEcoLovePoints,
      ecoScore: row.ecoScore,
      rank: row.rank,
      members: couple.members.map((m) => ({
        memberId: m.id,
        nickname: m.nickname,
        profileImageUrl: m.profileImageUrl ?? null,
      })),
    };
  }

  async breakup(memberId: string) {
    const member = await this.memberService.findByIdOrThrowException(memberId);

    const coupleId = member.couple?.id;
    if (!coupleId) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }

    const coupleWithMembers = await this.coupleRepo.findOne({
      where: { id: coupleId },
      relations: ['members'],
    });

    if (!coupleWithMembers || coupleWithMembers.members.length === 0) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
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

  async findByMemberIdOrThrowException(memberId: string): Promise<Couple> {
    const member = await this.memberService.findByIdOrThrowException(memberId);
    const couple = await this.findByMemberOrThrowException(member);
    if (!couple) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }
    return couple;
  }

  private async findByMemberOrThrowException(member: Member) {
    if (!member.couple) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }

    return await this.coupleRepo.findOne({
      where: { id: member.couple.id },
      relations: ['members'],
    });
  }

  async updateName(memberId: string, name: string) {
    const member = await this.memberService.findByIdOrThrowException(memberId);
    if (!member.couple) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }

    member.couple.name = name;
    await this.coupleRepo.save(member.couple);
  }

  async updateImage(
    memberId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const member = await this.memberService.findByIdOrThrowException(memberId);
    if (!member.couple) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }

    const fileInfo = getS3FileInfo('images/couple-images', file);
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: fileInfo.bucket,
          Key: fileInfo.key,
          Body: fileInfo.body,
          ContentType: fileInfo.contentType,
          Metadata: { owner: 'it' },
        }),
      );
    } catch (error) {
      throw new BusinessException(
        ErrorType.FILE_UPLOAD_FAIL,
        `S3 file upload fail: ${error.message}`,
      );
    }

    member.couple.profileImageUrl = fileInfo.s3Url;
    await this.coupleRepo.save(member.couple);
  }

  async uploadPhoto(file: Express.Multer.File): Promise<CouplePhoto> {
    const fileInfo = getS3FileInfo('images/couple-photos', file);
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: fileInfo.bucket,
          Key: fileInfo.key,
          Body: fileInfo.body,
          ContentType: fileInfo.contentType,
          Metadata: { owner: 'it' },
        }),
      );
    } catch (error) {
      throw new BusinessException(
        ErrorType.FILE_UPLOAD_FAIL,
        `S3 file upload fail: ${error.message}`,
      );
    }

    const couplePhoto = this.couplePhotoRepo.create({
      imageUrl: fileInfo.s3Url,
    });
    await this.couplePhotoRepo.save(couplePhoto);

    return couplePhoto;
  }
}
