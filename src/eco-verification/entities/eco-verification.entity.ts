import { Column, Entity, ManyToOne } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('eco_verification')
export class EcoVerification extends BaseEntity {
  @ManyToOne(() => Member, (member) => member.ecoVerifications, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @Column({ length: 500, nullable: true })
  s3ImageUrl?: string;

  @Column({ length: 20, nullable: true })
  result?: string; // e.g. 'PASS' | 'FAIL'

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  geoLat?: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  geoLng?: number;

  @Column({ length: 100, nullable: true })
  location?: string;
}
