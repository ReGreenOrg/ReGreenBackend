import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { Between, DataSource, Repository } from 'typeorm';
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
import {
  MemberEcoVerificationDto,
  MemberEcoVerificationGroupedDto,
} from './dto/member-eco-verification-grouped-response.dto';
import * as dayjs from 'dayjs';
import { CoupleService } from '../couple/couple.service';
import { MemberEcoVerificationSummaryResponseDto } from './dto/member-eco-verification-summary-response.dto';

@Injectable()
export class EcoVerificationService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
    @InjectRepository(MemberEcoVerification)
    private readonly memberEcoVerificationRepo: Repository<MemberEcoVerification>,
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
    imageUrl: string,
  ): Promise<MemberEcoVerificationSummaryResponseDto> {
    const [member, ecoVerification] = await Promise.all([
      this.memberService.findByIdOrThrowException(memberId),
      this.ecoVerificationRepo.findOneBy({ id: ecoVerificationId }),
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
      .andWhere('mev.status = :status', {
        status: EcoVerificationStatus.APPROVED,
      })
      .andWhere('DATE(mev.createdAt) = CURDATE()')
      .getExists();

    if (existsToday) {
      throw new BusinessException(
        ErrorType.ALREADY_SUBMITTED_ECO_VERIFICATION_TODAY,
      );
    }

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
          await manager.increment(
            Couple,
            { id: member.couple!.id },
            'ecoLovePoint',
            ecoVerification.ecoLovePoint,
          );
          await manager.increment(
            Couple,
            { id: member.couple!.id },
            'breakupBufferPoint',
            ecoVerification.breakupBufferPoint,
          );
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

  async submitLink(
    memberId: string,
    memberEcoVerificationId: string,
    url: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const memberEcoVerificationManager = manager.getRepository(
        MemberEcoVerification,
      );
      const coupleManager = manager.getRepository(Couple);

      const memberEcoVerification = await memberEcoVerificationManager.findOne({
        where: { id: memberEcoVerificationId },
        relations: ['member', 'member.couple'],
      });

      if (!memberEcoVerification) {
        throw new BusinessException(
          ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND,
        );
      }
      if (memberEcoVerification.member.id != memberId) {
        throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH);
      }

      if (memberEcoVerification.linkUrl) {
        throw new BusinessException(
          ErrorType.ALREADY_SUBMITTED_ECO_VERIFICATION_LINK,
        );
      }

      memberEcoVerification.linkUrl = url;
      await memberEcoVerificationManager.save(memberEcoVerification);

      const couple = memberEcoVerification.member.couple;
      if (!couple) {
        throw new BusinessException(ErrorType.COUPLE_NOT_FOUND);
      }

      couple.ecoLovePoint += 20;
      await coupleManager.save(couple);
    });
  }

  async getMyVerifications(
    memberId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDto<MemberEcoVerificationResponseDto>> {
    const [items, total] = await this.memberEcoVerificationRepo.findAndCount({
      where: { member: { id: memberId } },
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
      where: { id: memberEcoVerificationId },
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
        : dayjs().format('YYYY-MM-DD');
    const yesterdayDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');

    const startOfYesterday = dayjs(yesterdayDate).startOf('day').toDate();
    const endOfToday = dayjs(todayDate).endOf('day').toDate();

    const memberEcoVerifications = await this.memberEcoVerificationRepo.find({
      where: [
        { member: me, createdAt: Between(startOfYesterday, endOfToday) },
        { member: lover, createdAt: Between(startOfYesterday, endOfToday) },
      ],
      relations: ['ecoVerification', 'member'],
    });

    type VerMap = Record<string, MemberEcoVerification[]>;
    const groupedByDateAndMember: VerMap = {};

    for (const recMev of memberEcoVerifications) {
      const recDate = dayjs(recMev.createdAt).format('YYYY-MM-DD');
      const key = `${recDate}|${recMev.member.id}`;
      if (!groupedByDateAndMember[key]) {
        groupedByDateAndMember[key] = [];
      }
      groupedByDateAndMember[key].push(recMev);
    }

    const buildResultForDate = (targetDate: string) => {
      const memberGroupedResult: MemberEcoVerificationGroupedDto[] =
        members.map((m) => {
          const key = `${targetDate}|${m.id}`;
          const recs = groupedByDateAndMember[key] || [];
          const items: MemberEcoVerificationDto[] = recs.map((mev) => ({
            memberEcoVerificationId: mev.id,
            type: mev.ecoVerification.type,
            ecoLovePoint: mev.ecoVerification.ecoLovePoint,
            breakupBufferPoint: mev.ecoVerification.breakupBufferPoint,
            linkUrl: mev.linkUrl,
            status: mev.status,
          }));
          return {
            memberId: m.id,
            nickname: m.nickname,
            memberEcoVerifications: items,
          };
        });
      return { date: targetDate, members: memberGroupedResult };
    };

    return {
      today: buildResultForDate(todayDate),
      yesterday: buildResultForDate(yesterdayDate),
    };
  }

  async requestReview(
    memberId: string,
    memberEcoVerificationId: string,
  ): Promise<void> {
    const record = await this.memberEcoVerificationRepo.findOne({
      where: { id: memberEcoVerificationId },
      relations: ['member'],
    });

    if (!record) {
      throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND);
    }
    if (record.member.id !== memberId) {
      throw new BusinessException(ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH);
    }
    if (record.status !== EcoVerificationStatus.REJECTED) {
      throw new BusinessException(ErrorType.INVALID_ECO_REVIEW_REQUEST_STATUS);
    }

    record.status = EcoVerificationStatus.GOING_OVER;
    await this.memberEcoVerificationRepo.save(record);
  }
}
