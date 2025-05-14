import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Member } from '../../member/entities/member.entity';
import { CoupleFurniture } from '../../couple-furniture/entities/couple-furniture.entity';

@Entity('couple')
export class Couple extends BaseEntity {
  @Column({ type: 'int', unsigned: true, default: 10 })
  point: number;

  @Column({ type: 'int', default: 10 })
  breakupAt: number;

  @OneToMany(() => Member, (member) => member.couple, { eager: false })
  members: Member[];

  @OneToMany(() => CoupleFurniture, (cf) => cf.couple)
  items: CoupleFurniture[];
}
