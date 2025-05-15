import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MemberEcoVerification } from '../../member-eco-verification/entities/member-eco-verification.entity';

@Entity('eco_verification')
export class EcoVerification extends BaseEntity {
  @OneToMany(() => MemberEcoVerification, (mev) => mev.ecoVerification)
  memberLinks: MemberEcoVerification[];

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  point: number;

  @Column()
  breakupAtPoint: number;

  @Column()
  iconS3ImageUrl: string;
}
