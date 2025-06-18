import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { MemberEcoVerification } from '../member/entities/member-eco-verification.entity';
import { MemberService } from '../member/member.service';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';
import { OpenaiService } from '../../common/openai/openai.service';
import { EcoVerificationStatus } from '../member/constants/eco-verification.status.enum';
import { Couple } from '../couple/entities/couple.entity';
import { EcoVerificationResponseDto } from './dto/eco-verification-response.dto';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { MemberEcoVerificationResponseDto } from './dto/member-eco-verification-response.dto';
import { MemberEcoVerificationGroupedDto } from './dto/member-eco-verification-grouped-response.dto';
import * as dayjs from 'dayjs';
import { CoupleService } from '../couple/couple.service';
import { MemberEcoVerificationSummaryResponseDto } from './dto/member-eco-verification-summary-response.dto';
import { tz } from '../../common/utils/date-util';
import { Member } from '../member/entities/member.entity';
import { EcoVerificationType } from './constant/eco-verification-type.enum';
import { addDays } from 'date-fns';
import { getS3FileInfo } from '../../common/s3/s3.func';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class EcoVerificationService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
    @InjectRepository(MemberEcoVerification)
    private readonly memberEcoVerificationRepo: Repository<MemberEcoVerification>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private readonly memberService: MemberService,
    private readonly coupleService: CoupleService,
    private readonly openaiService: OpenaiService,
    private readonly dataSource: DataSource,
  ) {}

  async getEcoVerifications(): Promise<EcoVerificationResponseDto[]> {
    const rows = await this.ecoVerificationRepo
      .createQueryBuilder('e')
      .select([
        'e.id                  AS "id"',
        'e.title               AS "title"',
        'e.ecoLovePoint        AS "ecoLovePoint"',
        'e.breakupBufferPoint  AS "breakupBufferPoint"',
        'e.iconImageUrl        AS "iconImageUrl"',
      ])
      .where('e.type != :eventType', {
        eventType: EcoVerificationType.EVENT,
      })
      .orderBy('e.code', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      ecoVerificationId: row.id,
      title: row.title,
      ecoLovePoint: Number(row.ecoLovePoint),
      breakupBufferPoint: Number(row.breakupBufferPoint),
      iconImageUrl: row.iconImageUrl,
    }));
  }

  async verifyWithImage(
    memberId: string,
    ecoVerificationId: string,
    file: Express.Multer.File,
  ): Promise<MemberEcoVerificationSummaryResponseDto> {
    const [member, ecoVerification] = await Promise.all([
      this.memberService.findByIdOrThrowException(memberId),
      this.ecoVerificationRepo.findOne({
        where: {
          id: ecoVerificationId,
          type: Not(EcoVerificationType.EVENT),
        },
      }),
    ]);
    if (!member) {
      throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
    }
    if (!member.couple) {
      throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
    }
    if (!ecoVerification) {
      throw new BusinessException(ErrorType.ECO_VERIFICATION_NOT_FOUND);
    }

    const existsToday = await this.memberEcoVerificationRepo
      .createQueryBuilder('mev')
      .where('mev.memberId = :memberId', { memberId })
      .andWhere('mev.ecoVerificationId = :ecoVerificationId', {
        ecoVerificationId: ecoVerificationId,
      })
      .andWhere('mev.status != :status', {
        status: EcoVerificationStatus.REJECTED,
      })
      .andWhere('DATE(mev.createdAt) = :today', {
        today: tz().format('YYYY-MM-DD'),
      })
      .getExists();

    if (existsToday) {
      throw new BusinessException(
        ErrorType.ALREADY_APPROVED_ECO_VERIFICATION_TODAY,
      );
    }

    const fileInfo = getS3FileInfo('images/eco-verifications', file);
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

    const imageUrl = fileInfo.s3Url;
    const { isValid, reason } = await this.openaiService.verifyImageByType(
      imageUrl,
      ecoVerification.type,
    );

    const memberEcoVerification = await this.dataSource.transaction(
      async (manager) => {
        let record = manager.create(MemberEcoVerification, {
          member,
          ecoVerification,
          imageUrl,
          status: isValid
            ? EcoVerificationStatus.APPROVED
            : EcoVerificationStatus.REJECTED,
          aiReasonOfStatus: reason,
        });
        record = await manager.save(MemberEcoVerification, record);

        if (isValid) {
          const coupleRepo = manager.getRepository(Couple);
          const couple = await coupleRepo.findOneOrFail({
            where: { id: member.couple!.id },
            select: ['breakupAt'],
          });

          const newBreakupAt = addDays(
            couple.breakupAt,
            ecoVerification.breakupBufferPoint,
          );

          await manager
            .createQueryBuilder()
            .update(Couple)
            .set({
              ecoLovePoint: () =>
                `ecoLovePoint + ${ecoVerification.ecoLovePoint}`,
              breakupAt: newBreakupAt,
            })
            .where('id = :id', { id: member.couple!.id })
            .execute();
        }
        return record;
      },
    );

    return {
      memberEcoVerificationId: memberEcoVerification.id,
      imageUrl: memberEcoVerification.imageUrl,
      status: memberEcoVerification.status,
      aiReasonOfStatus: memberEcoVerification.aiReasonOfStatus,
      createdAt: memberEcoVerification.createdAt,
    };
  }

  async giveExtraPoints(
    memberId: string,
    memberEcoVerificationId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const memberEcoVerificationManager = manager.getRepository(
        MemberEcoVerification,
      );
      const memberEcoVerification = await memberEcoVerificationManager.findOne({
        where: {
          id: memberEcoVerificationId,
          ecoVerification: { type: Not(EcoVerificationType.EVENT) },
        },
        relations: ['member', 'member.couple', 'ecoVerification'],
      });

      if (!memberEcoVerification) {
        throw new BusinessException(
          ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND,
        );
      }
      if (!memberEcoVerification.member.couple) {
        throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
      }
      if (memberEcoVerification.member.id != memberId) {
        throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH);
      }
      if (memberEcoVerification.status !== EcoVerificationStatus.APPROVED) {
        throw new BusinessException(ErrorType.INVALID_ECO_SHARE_STATUS);
      }

      if (memberEcoVerification.isShared) {
        throw new BusinessException(ErrorType.ALREADY_GIVEN_SHARE_POINT);
      }

      memberEcoVerification.isShared = true;
      await memberEcoVerificationManager.save(memberEcoVerification);

      const couple = memberEcoVerification.member.couple;
      await manager.increment(Couple, { id: couple.id }, 'ecoLovePoint', 20);
    });
  }

  async getMyVerifications(
    memberId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDto<MemberEcoVerificationResponseDto>> {
    const [items, total] = await this.memberEcoVerificationRepo.findAndCount({
      where: {
        member: { id: memberId },
        ecoVerification: { type: Not(EcoVerificationType.EVENT) },
      },
      relations: ['ecoVerification'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      results: items.map((link) => ({
        ecoVerificationId: link.ecoVerification.id,
        title: link.ecoVerification.title,
        iconImageUrl: link.ecoVerification.iconImageUrl,
        ecoLovePoint: link.ecoVerification.ecoLovePoint,
        breakupBufferPoint: link.ecoVerification.breakupBufferPoint,
        memberEcoVerificationId: link.id,
        createdAt: link.createdAt,
        imageUrl: link.imageUrl,
        status: link.status,
        aiReasonOfStatus: link.aiReasonOfStatus,
      })),
      page,
      limit,
      total,
    };
  }

  async getMyVerificationDetail(
    memberId: string,
    memberEcoVerificationId: string,
  ): Promise<MemberEcoVerificationResponseDto> {
    const link = await this.memberEcoVerificationRepo.findOne({
      where: {
        id: memberEcoVerificationId,
        ecoVerification: { type: Not(EcoVerificationType.EVENT) },
      },
      relations: ['member', 'ecoVerification'],
    });
    if (!link) {
      throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND);
    }
    if (link.member.id !== memberId) {
      throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH);
    }
    return {
      ecoVerificationId: link.ecoVerification.id,
      title: link.ecoVerification.title,
      iconImageUrl: link.ecoVerification.iconImageUrl,
      ecoLovePoint: link.ecoVerification.ecoLovePoint,
      breakupBufferPoint: link.ecoVerification.breakupBufferPoint,
      memberEcoVerificationId: link.id,
      createdAt: link.createdAt,
      imageUrl: link.imageUrl,
      status: link.status,
      aiReasonOfStatus: link.aiReasonOfStatus,
    };
  }

  async getCoupleVerificationsWithYesterday(
    memberId: string,
    date?: string,
  ): Promise<{
    today: { date: string; members: MemberEcoVerificationGroupedDto[] };
    yesterday: { date: string; members: MemberEcoVerificationGroupedDto[] };
  }> {
    const couple =
      await this.coupleService.findByMemberIdOrThrowException(memberId);

    const members = couple.members;
    const [me, lover] = members;

    const todayDate =
      date && date.trim().length
        ? dayjs(date).format('YYYY-MM-DD')
        : tz().format('YYYY-MM-DD');
    Logger.debug(
      `[getCoupleVerifications] Today >>> ${tz().format()} >>> ${todayDate}`,
    );
    const yesterdayDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');

    const rawRecs = await this.memberEcoVerificationRepo
      .createQueryBuilder('mev')
      .innerJoinAndSelect('mev.ecoVerification', 'ev')
      .innerJoinAndSelect('mev.member', 'm')
      .where('m.id IN (:...ids)', { ids: [me.id, lover.id] })
      .andWhere('DATE(mev.createdAt) IN (:...dates)', {
        dates: [yesterdayDate, todayDate],
      })
      .andWhere('ev.type != :eventType', {
        eventType: EcoVerificationType.EVENT,
      })
      .getMany();

    const grouped = rawRecs.reduce<Record<string, MemberEcoVerification[]>>(
      (acc, rec) => {
        const d = dayjs(rec.createdAt).format('YYYY-MM-DD');
        const key = `${d}|${rec.member.id}`;
        (acc[key] = acc[key] || []).push(rec);
        return acc;
      },
      {},
    );

    const build = (targetDate: string) => ({
      date: targetDate,
      members: members.map((m) => {
        const key = `${targetDate}|${m.id}`;
        const items =
          (grouped[key] || []).map((mev) => ({
            memberEcoVerificationId: mev.id,
            type: mev.ecoVerification.type,
            ecoLovePoint: mev.ecoVerification.ecoLovePoint,
            breakupBufferPoint: mev.ecoVerification.breakupBufferPoint,
            status: mev.status,
            imageUrl: mev.imageUrl,
          })) || [];
        return {
          isMe: m.id === memberId,
          memberId: m.id,
          nickname: m.id === memberId ? `${m.nickname}(나)` : m.nickname,
          memberEcoVerifications: items,
        };
      }),
    });

    return {
      today: build(todayDate),
      yesterday: build(yesterdayDate),
    };
  }

  async requestReview(
    memberId: string,
    memberEcoVerificationId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(MemberEcoVerification, {
        where: {
          id: memberEcoVerificationId,
          ecoVerification: { type: Not(EcoVerificationType.EVENT) },
        },
        relations: ['member', 'ecoVerification'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) {
        throw new BusinessException(
          ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND,
        );
      }
      if (record.member.id !== memberId) {
        throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH);
      }

      const existsToday = await manager
        .createQueryBuilder(MemberEcoVerification, 'mev')
        .innerJoin('mev.ecoVerification', 'ev')
        .where('mev.memberId = :memberId', { memberId })
        .andWhere('mev.status != :status', {
          status: EcoVerificationStatus.REJECTED,
        })
        .andWhere('ev.type = :type', { type: record.ecoVerification.type })
        .andWhere('DATE(mev.createdAt) = :today', {
          today: tz().format('YYYY-MM-DD'),
        })
        .getExists();
      if (existsToday) {
        throw new BusinessException(
          ErrorType.ALREADY_APPROVED_ECO_VERIFICATION_TODAY,
        );
      }

      record.status = EcoVerificationStatus.GOING_OVER;
      await manager.save(record);
    });
  }

  async easterEgg(memberId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const member = await manager.findOne(Member, {
        where: { id: memberId },
        relations: ['couple'],
      });
      if (!member) {
        throw new BusinessException(ErrorType.MEMBER_NOT_FOUND);
      }
      if (!member.couple) {
        throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
      }

      const ev = await manager.findOne(EcoVerification, {
        where: { code: 'event-00' },
      });
      if (!ev) {
        throw new BusinessException(ErrorType.ECO_VERIFICATION_NOT_FOUND);
      }

      const isDuplicatedEvent = await this.memberEcoVerificationRepo
        .createQueryBuilder('mev')
        .where('mev.memberId = :memberId', { memberId })
        .andWhere('mev.ecoVerificationId = :ecoVerificationId', {
          ecoVerificationId: ev.id,
        })
        .getExists();
      if (isDuplicatedEvent) {
        throw new BusinessException(ErrorType.ALREADY_APPROVED_EVENT);
      }

      const mev = manager.create(MemberEcoVerification, {
        member,
        ecoVerification: ev,
        status: EcoVerificationStatus.APPROVED,
        imageUrl: '',
      });
      await manager.save(MemberEcoVerification, mev);

      await manager.increment(
        Couple,
        { id: member.couple.id },
        'ecoLovePoint',
        ev.ecoLovePoint,
      );
    });
  }
}
