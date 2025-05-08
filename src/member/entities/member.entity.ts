import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  profileImageUrl: string;

  @BeforeInsert()
  async beforeSaveFunction(): Promise<void> {
    // TODO: 기본 프로필 이미지
  }

  /* Relations --------------------------------------------------- */
  // @ManyToOne(() => Couple, (couple) => couple.members, {
  //   onDelete: 'CASCADE',
  // })
  // couple: Couple;
  //
  // @OneToMany(() => EcoVerification, (ev) => ev.member)
  // ecoVerifications: EcoVerification[];
}
