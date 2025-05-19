import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Couple } from '../../couple/entities/couple.entity';
import { Item } from '../../item/entities/item.entity';

@Entity('couple_item')
@Unique(['couple', 'item'])
export class CoupleItem extends BaseEntity {
  @ManyToOne(() => Couple, (couple) => couple.items, {
    onDelete: 'CASCADE',
  })
  couple: Couple;

  @ManyToOne(() => Item, (item) => item.ownedBy, {
    onDelete: 'CASCADE',
  })
  item: Item;

  @Column({ type: 'boolean', default: true })
  isPlaced: boolean;
}
