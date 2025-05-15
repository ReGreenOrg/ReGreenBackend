import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly memberService: MemberService,
    @InjectRepository(MemberEcoVerification)
    private readonly memberEcoVerificationRepo: Repository<MemberEcoVerification>,
  ) {}

  async getEcoVerifications() {
    const rows = await this.ecoVerificationRepo
      .createQueryBuilder('e')
      .select([
        'e.id              AS "id"',
        'e.title           AS "title"',
        'e.point           AS "point"',
        'e.breakupAtPoint  AS "breakupAtPoint"',
      ])
      .orderBy('e.code', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      ecoVerificationId: row.id,
      title: row.title,
      point: Number(row.point),
      breakupAtPoint: Number(row.breakupAtPoint),
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
    if (!member) throw new NotFoundException('Not found member');
    if (!eco) throw new NotFoundException('Invalid EcoVerificationId');

    const link = this.memberEcoVerificationRepo.create({
      member,
      ecoVerification: eco,
      s3ImageUrl: imageUrl,
    });
    const saved = await this.memberEcoVerificationRepo.save(link);
    return {
      memberEcoVerificationId: saved.id,
      status: saved.status,
      s3ImageUrl: saved.s3ImageUrl,
    };
  }

  // async reviewAndReward(
  //   linkId: string,
  //   newStatus: EcoVerificationStatus,
  // ): Promise<MemberEcoVerification> {
  //   if (
  //     newStatus !== EcoVerificationStatus.SUCCESS &&
  //     newStatus !== EcoVerificationStatus.PENDING
  //   ) {
  //     throw new BadRequestException('올바르지 않은 상태 전환입니다.');
  //   }
  //
  //   return this.dataSource.transaction(async (manager) => {
  //     const link = await manager.findOne(MemberEcoVerification, {
  //       where: { id: linkId },
  //       relations: ['member', 'ecoVerification'],
  //     });
  //     if (!link) throw new NotFoundException('인증 내역을 찾을 수 없습니다.');
  //
  //     if (link.status === EcoVerificationStatus.SUCCESS) {
  //       throw new BadRequestException('이미 완료된 인증입니다.');
  //     }
  //
  //     link.status = newStatus;
  //     const savedLink = await manager.save(link);
  //
  //     if (newStatus === EcoVerificationStatus.SUCCESS) {
  //       const eco = link.ecoVerification;
  //       await manager
  //         .createQueryBuilder()
  //         .update(Member)
  //         .set({
  //           point: () => `point + ${eco.point}`,
  //           breakupAt: () => `breakupAt + ${eco.breakupAtPoint}`,
  //         })
  //         .where('id = :id', { id: link.member.id })
  //         .execute();
  //     }
  //
  //     return savedLink;
  //   });
  // }
}
