import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { DataSource, Repository } from 'typeorm';
import { CoupleItem } from '../couple-item/entities/couple-item.entity';
import { MemberService } from '../member/member.service';
import { ItemDto } from './dto/item.dto';
import { Couple } from '../couple/entities/couple.entity';
import { ItemPlacementDto } from './dto/update-item-placement.dto';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code.enum';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    private readonly membersService: MemberService,
    private readonly dataSource: DataSource,
  ) {}

  async getAll(memberId: string): Promise<ItemDto[]> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BusinessException(ErrorCode.COUPLE_NOT_FOUND);
    }

    const rows = await this.itemRepo
      .createQueryBuilder('i')
      .leftJoin(
        CoupleItem,
        'ci',
        'ci.itemId = i.id AND ci.coupleId = :coupleId',
        { coupleId: couple.id },
      )
      .select([
        'i.id                AS "itemId"',
        'i.name              AS "name"',
        'i.price             AS "price"',
        'i.imageUrl          AS "imageUrl"',
        'i.previewImageUrl   AS "previewImageUrl"',
        'i.category          AS "category"',
        'i.zIndex            AS "zIndex"',
        'ci.id               AS "coupleItemId"',
        'ci.isPlaced         AS "isPlaced"',
      ])
      .orderBy('i.zIndex', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      itemId: row.itemId,
      name: row.name,
      price: Number(row.price),
      imageUrl: row.imageUrl,
      previewImageUrl: row.previewImageUrl,
      category: row.category,
      isOwned: !!row.coupleItemId,
      coupleItemId: row.coupleItemId ?? null,
      isPlaced: row.coupleItemId ? !!row.isPlaced : false,
      zIndex: row.coupleItemId
        ? row.zIndex !== null
          ? Number(row.zIndex)
          : null
        : null,
    }));
  }

  async getOne(memberId: string, itemId: string): Promise<ItemDto> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BusinessException(ErrorCode.COUPLE_NOT_FOUND);
    }

    const row = await this.itemRepo
      .createQueryBuilder('i')
      .leftJoin(
        CoupleItem,
        'ci',
        'ci.itemId = i.id AND ci.coupleId = :coupleId',
        { coupleId: couple.id },
      )
      .where('i.id = :itemId', { itemId: itemId })
      .select([
        'i.id                AS "itemId"',
        'i.name              AS "name"',
        'i.price             AS "price"',
        'i.imageUrl          AS "imageUrl"',
        'i.previewImageUrl   AS "previewImageUrl"',
        'i.category          AS "category"',
        'i.zIndex            AS "zIndex"',
        'ci.id               AS "coupleItemId"',
        'ci.isPlaced         AS "isPlaced"',
      ])
      .orderBy('i.zIndex', 'ASC')
      .getRawOne();

    if (!row) {
      throw new BusinessException(ErrorCode.ITEM_NOT_FOUND);
    }

    return {
      itemId: row.itemId,
      name: row.name,
      price: Number(row.price),
      imageUrl: row.imageUrl,
      previewImageUrl: row.previewImageUrl,
      category: row.category,
      isOwned: !!row.coupleItemId,
      coupleItemId: row.coupleItemId ?? null,
      isPlaced: row.coupleItemId ? !!row.isPlaced : false,
      zIndex: row.coupleItemId
        ? row.zIndex !== null
          ? Number(row.zIndex)
          : null
        : null,
    };
  }

  async purchase(
    memberId: string,
    itemId: string,
  ): Promise<{
    coupleItemId: string;
  }> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BusinessException(ErrorCode.COUPLE_NOT_FOUND);
    }

    return this.dataSource.transaction(async (manager) => {
      const item = await manager.getRepository(Item).findOneBy({ id: itemId });
      if (!item) {
        throw new BusinessException(ErrorCode.ITEM_NOT_FOUND);
      }

      const coupleItemManager = manager.getRepository(CoupleItem);
      const existing = await coupleItemManager.findOne({
        where: { couple: { id: couple.id }, item: { id: item.id } },
      });
      if (existing) {
        throw new BusinessException(ErrorCode.ALREADY_OWNED_ITEM);
      }

      if (couple.ecoLovePoint < item.price) {
        throw new BusinessException(ErrorCode.NOT_ENOUGH_POINTS);
      }
      couple.ecoLovePoint -= item.price;
      await manager.getRepository(Couple).save(couple);

      const coupleItem = coupleItemManager.create({
        couple: { id: couple.id } as Couple,
        item: { id: item.id } as Item,
      });
      await coupleItemManager.save(coupleItem);

      return {
        coupleItemId: coupleItem.id,
      };
    });
  }

  async updatePlacement(
    memberId: string,
    itemPlacementDtos: ItemPlacementDto[],
  ) {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BusinessException(ErrorCode.COUPLE_NOT_FOUND);
    }

    return this.dataSource.transaction(async (manager) => {
      const coupleItemManager = manager.getRepository(CoupleItem);
      const updatedItemPlacements: ItemPlacementDto[] = [];

      for (const dto of itemPlacementDtos) {
        const coupleItem = await coupleItemManager.findOne({
          where: { id: dto.coupleItemId, couple: { id: couple.id } },
          relations: ['couple'],
        });
        if (!coupleItem) {
          throw new BusinessException(ErrorCode.COUPLE_ITEM_NOT_FOUND);
        }

        coupleItem.isPlaced = dto.isPlaced;
        await coupleItemManager.save(coupleItem);
        updatedItemPlacements.push(dto);
      }

      return updatedItemPlacements;
    });
  }
}
