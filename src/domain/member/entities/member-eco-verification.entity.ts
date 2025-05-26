import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Member } from './member.entity';
import { EcoVerification } from '../../eco-verification/entities/eco-verification.entity';
import { EcoVerificationStatus } from '../constants/eco-verification.status.enum';

@Entity('member_eco_verification')
export class MemberEcoVerification extends BaseEntity {
  @Column({ length: 500 })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: EcoVerificationStatus,
    default: EcoVerificationStatus.GOING_OVER,
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
