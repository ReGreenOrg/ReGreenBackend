import { ItemCategory } from '../constant/item-category.enum';

export interface ItemDto {
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
