import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
@Index(['member', 'token'], { unique: true })
export class RefreshToken extends BaseEntity {
  @Column() // SHA256 해시
  token: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @ManyToOne(() => Member, (m) => m.refreshTokens, { onDelete: 'CASCADE' })
  member: Member;
}
