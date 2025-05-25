import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { DataSource, Repository } from 'typeorm';
import { MemberEcoVerification } from '../member-eco-verification/entities/member-eco-verification.entity';
import { MemberService } from '../member/member.service';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code.enum';
import { OpenaiService } from '../openai/openai.service';
import { EcoVerificationStatus } from '../member-eco-verification/constant/eco-verification.status.enum';
import { Member } from '../member/entities/member.entity';
import { Couple } from '../couple/entities/couple.entity';

@Injectable()
export class EcoVerificationService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
    @InjectRepository(MemberEcoVerification)
    private readonly memberEcoVerificationRepo: Repository<MemberEcoVerification>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly memberService: MemberService,
    private readonly openaiService: OpenaiService,
    private readonly dataSource: DataSource,
  ) {}

  async getEcoVerifications() {
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
  ) {
    const [member, ecoVerification] = await Promise.all([
      this.memberService.getMemberById(memberId),
      this.ecoVerificationRepo.findOneBy({ id: ecoVerificationId }),
    ]);
    if (!member) {
      throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
    }
    if (!member.couple) {
      throw new BusinessException(ErrorCode.COUPLE_NOT_FOUND);
    }
    if (!ecoVerification) {
      throw new BusinessException(ErrorCode.ECO_VERIFICATION_NOT_FOUND);
    }

    // const existsToday = await this.memberEcoVerificationRepo
    //   .createQueryBuilder('me')
    //   .where('me.memberId = :memberId', { memberId })
    //   .andWhere('me.ecoVerificationId = :ecoVerificationId', {
    //     ecoVerificationId: ecoVerificationId,
    //   })
    //   .andWhere('DATE(me.createdAt) = CURDATE()')
    //   .getExists();
    //
    // if (existsToday) {
    //   throw new BusinessException(
    //     ErrorCode.ALREADY_SUBMITTED_ECO_VERIFICATION_TODAY,
    //   );
    // }

    const { isValid, reason } = await this.openaiService.verifyImageByType(
      imageUrl,
      ecoVerification.type,
    );

    return await this.dataSource.transaction(async (manager) => {
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
    });
  }

  async submitLink(
    memberId: string,
    memberEcoVerificationId: string,
    url: string,
  ) {
    const record = await this.memberEcoVerificationRepo.findOne({
      where: { id: memberEcoVerificationId },
      relations: ['member'],
    });

    if (!record) {
      throw new BusinessException(ErrorCode.MEMBER_ECO_VERIFICATION_NOT_FOUND);
    }
    if (record.member.id !== memberId) {
      throw new BusinessException(ErrorCode.MEMBER_ECO_VERIFICATION_MISMATCH);
    }
    record.linkUrl = url;
    return this.memberEcoVerificationRepo.save(record);
  }

  async getMyVerifications(memberId: string, page: number, limit: number) {
    const [items, total] = await this.memberEcoVerificationRepo.findAndCount({
      where: { member: { id: memberId } },
      relations: ['ecoVerification'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      ecoVerifications: items.map((link) => ({
        ecoVerificationId: link.ecoVerification.id,
        title: link.ecoVerification.title,
        iconImageUrl: link.ecoVerification.iconImageUrl,
        ecoLovePoint: link.ecoVerification.ecoLovePoint,
        breakupBufferPoint: link.ecoVerification.breakupBufferPoint,
        memberEcoVerificationId: link.id,
        createdAt: link.createdAt.toISOString(),
        imageUrl: link.imageUrl,
        status: link.status,
        location: link.location,
        geoLat: link.geoLat,
        geoLng: link.geoLng,
      })),
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getMyVerificationDetail(
    memberId: string,
    memberEcoVerificationId: string,
  ) {
    const link = await this.memberEcoVerificationRepo.findOne({
      where: { id: memberEcoVerificationId },
      relations: ['member', 'ecoVerification'],
    });
    if (!link) {
      throw new BusinessException(ErrorCode.MEMBER_ECO_VERIFICATION_NOT_FOUND);
    }
    if (link.member.id !== memberId) {
      throw new BusinessException(ErrorCode.MEMBER_ECO_VERIFICATION_MISMATCH);
    }
    return {
      ecoVerificationId: link.ecoVerification.id,
      title: link.ecoVerification.title,
      iconImageUrl: link.ecoVerification.iconImageUrl,
      ecoLovePoint: link.ecoVerification.ecoLovePoint,
      breakupBufferPoint: link.ecoVerification.breakupBufferPoint,
      memberEcoVerificationId: link.id,
      createdAt: link.createdAt.toISOString(),
      imageUrl: link.imageUrl,
      status: link.status,
      location: link.location,
      geoLat: link.geoLat,
      geoLng: link.geoLng,
    };
  }
}
