import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Member } from '../../member/entities/member.entity';
import { EcoVerification } from '../../eco-verification/entities/eco-verification.entity';
import { EcoVerificationStatus } from '../constant/eco-verification.status.enum';

@Entity('member_eco_verification')
export class MemberEcoVerification extends BaseEntity {
  @Column({ length: 500, nullable: true })
  imageUrl?: string;

  @Column({
    type: 'enum',
    enum: EcoVerificationStatus,
  })
  status: EcoVerificationStatus;

  @Column({ nullable: true })
  aiReasonOfStatus: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  geoLat?: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  geoLng?: number;

  @Column({ length: 100, nullable: true })
  location?: string;

  @Column({ nullable: true })
  linkUrl?: string;

  @ManyToOne(() => Member, (member) => member.ecoVerificationLinks, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @ManyToOne(() => EcoVerification, (ev) => ev.memberLinks, {
    onDelete: 'CASCADE',
  })
  ecoVerification: EcoVerification;
}
