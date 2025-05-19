import { FurnitureCategory } from '../constant/furniture-category.enum';

export interface FurnitureDto {
  furnitureId: string;
  name: string;
  price: number;
  s3ImageUrl: string;
  s3PreviewImageUrl: string;
  category: FurnitureCategory;
  isOwned: boolean;
  coupleFurnitureId?: string | null;
  isPlaced?: boolean | null;
  zIndex?: number | null;
}
