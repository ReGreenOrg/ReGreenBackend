import { FurnitureCategory } from '../constant/furniture-category.enum';

export interface FurnitureDto {
  furnitureId: string;
  name: string;
  description: string;
  price: number;
  s3ImageUrl: string;
  category: FurnitureCategory;
  isOwned: boolean;
  coupleFurnitureId?: string | null;
  isPlaced?: boolean | null;
  zIndex?: number | null;
}
