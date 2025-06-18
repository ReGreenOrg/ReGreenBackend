import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('couple_photo')
export class CouplePhoto extends BaseEntity {
  @Column()
  imageUrl: string;
}
