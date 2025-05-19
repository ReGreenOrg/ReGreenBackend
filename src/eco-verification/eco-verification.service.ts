import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';
import { Repository } from 'typeorm';
import { MemberEcoVerification } from '../member-eco-verification/entities/member-eco-verification.entity';
import { MemberService } from '../member/member.service';

@Injectable()
export class EcoVerificationService {
  constructor(
    @InjectRepository(EcoVerification)
    private readonly ecoVerificationRepo: Repository<EcoVerification>,
    @InjectRepository(MemberEcoVerification)
    private readonly memberEcoVerificationRepo: Repository<MemberEcoVerification>,
    private readonly memberService: MemberService,
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

  async submitWithPhoto(
    memberId: string,
    ecoVerificationId: string,
    imageUrl: string,
  ) {
    const member = await this.memberService.getMemberById(memberId);
    const eco = await this.ecoVerificationRepo.findOne({
      where: { id: ecoVerificationId },
    });
    if (!member) throw new NotFoundException('Member not found.');
    if (!eco) throw new NotFoundException('Invalid EcoVerificationId');

    const link = this.memberEcoVerificationRepo.create({
      member,
      ecoVerification: eco,
      imageUrl: imageUrl,
    });
    const saved = await this.memberEcoVerificationRepo.save(link);

    return {
      memberEcoVerificationId: saved.id,
      status: saved.status,
      imageUrl: imageUrl,
    };
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
      throw new NotFoundException('인증 내역을 찾을 수 없습니다.');
    }
    if (record.member.id !== memberId) {
      throw new ForbiddenException('본인 요청이 아닙니다.');
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
      throw new NotFoundException('인증 내역이 존재하지 않습니다.');
    }
    if (link.member.id !== memberId) {
      throw new ForbiddenException('해당 인증 내역에 접근할 권한이 없습니다.');
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
