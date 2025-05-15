export class FurniturePlacementDto {
  coupleFurnitureId: string;
  isPlaced: boolean;
}

export class UpdatePlacementsDto {
  placements: FurniturePlacementDto[];
}
