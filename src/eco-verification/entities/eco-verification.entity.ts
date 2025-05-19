import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MemberEcoVerification } from '../../member-eco-verification/entities/member-eco-verification.entity';

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

  @Column()
  iconImageUrl: string;

  @OneToMany(() => MemberEcoVerification, (mev) => mev.ecoVerification)
  memberLinks: MemberEcoVerification[];
}
