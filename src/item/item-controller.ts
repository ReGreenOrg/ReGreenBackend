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
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ItemDto } from './dto/item.dto';
import { UpdateItemPlacementsDto } from './dto/update-item-placement.dto';

@Controller('item')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.ITEM)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async list(@Req() req): Promise<ItemDto[]> {
    return await this.itemService.getAll(req.user.memberId);
  }

  @Get(':itemId')
  async one(
    @Req() req,
    @Param('itemId') itemId: string,
  ): Promise<ItemDto> {
    return await this.itemService.getOne(req.user.memberId, itemId);
  }

  @Post(':itemId')
  async purchase(
    @Req() req,
    @Param('itemId') itemId: string,
  ): Promise<{
    coupleItemId: string;
  }> {
    return await this.itemService.purchase(req.user.memberId, itemId);
  }

  @Patch()
  async updatePlacement(@Req() req: any, @Body() dto: UpdateItemPlacementsDto) {
    await this.itemService.updatePlacement(req.user.memberId, dto.placements);
  }
}
