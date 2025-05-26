import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPlacementDto {
  @IsNotEmpty()
  coupleItemId: string;
  @IsBoolean()
  isPlaced: boolean;
}

export class UpdateItemPlacementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPlacementDto)
  placements: ItemPlacementDto[];
}
