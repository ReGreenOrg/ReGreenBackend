import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ItemResponseDto } from './dto/item-response.dto';
import { UpdateItemPlacementsDto } from './dto/update-item-placement.dto';
import { RequestMember } from '../../common/dto/request-user.dto';

@Controller('items')
@UseGuards(JwtAccessGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async list(@Req() req: RequestMember): Promise<ItemResponseDto[]> {
    return await this.itemService.getAll(req.user.memberId);
  }

  @Get(':itemId')
  async one(
    @Req() req: RequestMember,
    @Param('itemId') itemId: string,
  ): Promise<ItemResponseDto> {
    return await this.itemService.getOne(req.user.memberId, itemId);
  }

  @Post(':itemId/purchase')
  async purchase(
    @Req() req: RequestMember,
    @Param('itemId') itemId: string,
  ): Promise<{
    coupleItemId: string;
  }> {
    return await this.itemService.purchase(req.user.memberId, itemId);
  }

  @Patch('placements')
  async updatePlacement(
    @Req() req: RequestMember,
    @Body() dto: UpdateItemPlacementsDto,
  ): Promise<void> {
    await this.itemService.updatePlacement(req.user.memberId, dto.placements);
  }
}
