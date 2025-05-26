import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ItemCategory } from '../constant/item-category.enum';
import { CoupleItem } from '../../couple/entities/couple-item.entity';

@Entity('item')
export class Item extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column()
  price: number;

  @Column({ type: 'enum', enum: ItemCategory })
  category: ItemCategory;

  @Column()
  zIndex: number;

  @Column()
  imageUrl: string;

  @Column()
  previewImageUrl: string;

  /* relations */
  @OneToMany(() => CoupleItem, (cf) => cf.item)
  ownedBy: CoupleItem[];
}
