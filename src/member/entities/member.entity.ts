import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Couple } from '../../couple/entities/couple.entity';
import { EcoVerification } from '../../eco-verification/entities/eco-verification.entity';

@Entity('member')
export class Member extends BaseEntity {
  @Column()
  nickname: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column()
  profileImageUrl: string;

  @ManyToOne(() => Couple, (couple) => couple.members, {
    onDelete: 'SET NULL',
    cascade: false,
    nullable: true,
  })
  @JoinColumn({ name: 'couple_id' })
  couple?: Couple | null;

  @OneToMany(
    () => EcoVerification,
    (ecoVerification) => ecoVerification.member,
    {
      cascade: false,
    },
  )
  ecoVerifications: EcoVerification[];
}
