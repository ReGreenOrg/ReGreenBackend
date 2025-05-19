export class ItemPlacementDto {
  coupleItemId: string;
  isPlaced: boolean;
}

export class UpdateItemPlacementsDto {
  placements: ItemPlacementDto[];
}
