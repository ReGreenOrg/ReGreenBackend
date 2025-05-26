import { ItemCategory } from '../constant/item-category.enum';

export class ItemResponseDto {
  itemId: string;
  name: string;
  price: number;
  imageUrl: string;
  previewImageUrl: string;
  category: ItemCategory;
  isOwned: boolean;
  coupleItemId?: string | null;
  isPlaced?: boolean | null;
  zIndex?: number | null;
}
