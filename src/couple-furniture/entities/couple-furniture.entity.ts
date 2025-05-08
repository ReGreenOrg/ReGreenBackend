import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Couple } from '../../couple/entities/couple.entity';
import { Furniture } from '../../furniture/entities/furniture.entity';

@Entity()
@Unique(['couple', 'furniture'])
export class CoupleFurniture extends BaseEntity {
  @ManyToOne(() => Couple, (couple) => couple.items, {
    onDelete: 'CASCADE',
  })
  couple: Couple;

  @ManyToOne(() => Furniture, (furniture) => furniture.ownedBy, {
    onDelete: 'CASCADE',
  })
  furniture: Furniture;

  @Column({ type: 'boolean', default: false })
  isPlaced: boolean;
}
