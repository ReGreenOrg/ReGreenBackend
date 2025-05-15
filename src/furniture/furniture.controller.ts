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
import { FurnitureService } from './furniture.service';
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { FurnitureDto } from './dto/furniture.dto';
import { UpdatePlacementsDto } from './dto/update-furniture-placement.dto';

@Controller('furniture')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.FURNITURE)
export class FurnitureController {
  constructor(private readonly furnitureService: FurnitureService) {}

  @Get()
  async list(@Req() req): Promise<FurnitureDto[]> {
    return await this.furnitureService.getAll(req.user.memberId);
  }

  @Get(':furnitureId')
  async one(
    @Req() req,
    @Param('furnitureId') furnitureId: string,
  ): Promise<FurnitureDto> {
    return await this.furnitureService.getOne(req.user.memberId, furnitureId);
  }

  @Post(':furnitureId')
  async purchase(
    @Req() req,
    @Param('furnitureId') furnitureId: string,
  ): Promise<{
    coupleFurnitureId: string;
  }> {
    return await this.furnitureService.purchase(req.user.memberId, furnitureId);
  }

  @Patch()
  async updatePlacement(@Req() req: any, @Body() dto: UpdatePlacementsDto) {
    await this.furnitureService.updatePlacement(
      req.user.memberId,
      dto.placements,
    );
  }
}
