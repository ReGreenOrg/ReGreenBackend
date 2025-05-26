import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Member } from '../../member/entities/member.entity';
import { CoupleItem } from './couple-item.entity';

@Entity('couple')
export class Couple extends BaseEntity {
  @Column({ type: 'int', unsigned: true, default: 50 })
  ecoLovePoint: number;

  @Column({ type: 'int', default: 14 })
  breakupBufferPoint: number;

  @OneToMany(() => Member, (member) => member.couple, { eager: false })
  members: Member[];

  @OneToMany(() => CoupleItem, (cf) => cf.couple)
  items: CoupleItem[];
}
