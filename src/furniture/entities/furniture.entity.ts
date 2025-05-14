import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { FurnitureCategory } from '../constant/furniture-category.enum';
import { CoupleFurniture } from '../../couple-furniture/entities/couple-furniture.entity';

@Entity('furniture')
export class Furniture extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ type: 'enum', enum: FurnitureCategory })
  category: FurnitureCategory;

  @Column()
  zIndex: number;

  @Column()
  s3ImageUrl: string;

  @Column()
  s3PreviewImageUrl: string;

  /* relations */
  @OneToMany(() => CoupleFurniture, (cf) => cf.furniture)
  ownedBy: CoupleFurniture[];
}
