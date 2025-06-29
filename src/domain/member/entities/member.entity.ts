import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Couple } from '../../couple/entities/couple.entity';
import { MemberEcoVerification } from './member-eco-verification.entity';

@Entity('member')
export class Member extends BaseEntity {
  @Column({ default: false })
  isFake: boolean;

  @Column()
  nickname: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @ManyToOne(() => Couple, (couple) => couple.members, {
    onDelete: 'SET NULL',
    cascade: false,
    nullable: true,
  })
  @JoinColumn({ name: 'coupleId' })
  couple?: Couple | null;

  @OneToMany(() => MemberEcoVerification, (mev) => mev.member)
  ecoVerificationLinks: MemberEcoVerification[];
}
