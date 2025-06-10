import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { MemberEcoVerification } from '../../member/entities/member-eco-verification.entity';
import { EcoVerificationType } from '../constant/eco-verification-type.enum';

@Entity('eco_verification')
export class EcoVerification extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  ecoLovePoint: number;

  @Column()
  breakupBufferPoint: number;

  @Column({ nullable: true })
  iconImageUrl: string;

  @Column({ type: 'enum', enum: EcoVerificationType })
  type: EcoVerificationType;

  @OneToMany(() => MemberEcoVerification, (mev) => mev.ecoVerification)
  memberLinks: MemberEcoVerification[];
}
