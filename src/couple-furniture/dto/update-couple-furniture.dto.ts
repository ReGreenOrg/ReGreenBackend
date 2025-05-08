import { PartialType } from '@nestjs/mapped-types';
import { CreateCoupleFurnitureDto } from './create-couple-furniture.dto';

export class UpdateCoupleFurnitureDto extends PartialType(CreateCoupleFurnitureDto) {}
