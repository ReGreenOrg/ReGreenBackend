import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { DataSource, Repository } from 'typeorm';
import { CoupleFurniture } from '../couple-furniture/entities/couple-furniture.entity';
import { MemberService } from '../member/member.service';
import { FurnitureDto } from './dto/furniture.dto';
import { Couple } from '../couple/entities/couple.entity';
import { FurniturePlacementDto } from './dto/update-furniture-placement.dto';

@Injectable()
export class FurnitureService {
  constructor(
    @InjectRepository(Furniture)
    private readonly furnitureRepo: Repository<Furniture>,
    private readonly membersService: MemberService,
    private readonly dataSource: DataSource,
  ) {}

  async getAll(memberId: string): Promise<FurnitureDto[]> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) throw new BadRequestException('Couple not found');

    const rows = await this.furnitureRepo
      .createQueryBuilder('f')
      .leftJoin(
        CoupleFurniture,
        'cf',
        'cf.furnitureId = f.id AND cf.coupleId = :coupleId',
        { coupleId: couple.id },
      )
      .select([
        'f.id                AS "furnitureId"',
        'f.name              AS "name"',
        'f.description       AS "description"',
        'f.price             AS "price"',
        'f.s3ImageUrl        AS "s3ImageUrl"',
        'f.s3PreviewImageUrl AS "s3PreviewImageUrl"',
        'f.category          AS "category"',
        'f.zIndex            AS "zIndex"',
        'cf.id               AS "coupleFurnitureId"',
        'cf.isPlaced         AS "isPlaced"',
      ])
      .orderBy('f.zIndex', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      furnitureId: row.furnitureId,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      s3ImageUrl: row.s3ImageUrl,
      s3PreviewImageUrl: row.s3PreviewImageUrl,
      category: row.category,
      isOwned: !!row.coupleFurnitureId,
      coupleFurnitureId: row.coupleFurnitureId ?? null,
      isPlaced: row.coupleFurnitureId ? !!row.isPlaced : false,
      zIndex: row.coupleFurnitureId
        ? row.zIndex !== null
          ? Number(row.zIndex)
          : null
        : null,
    }));
  }

  async getOne(memberId: string, furnitureId: string): Promise<FurnitureDto> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) throw new BadRequestException('Couple not found');

    const row = await this.furnitureRepo
      .createQueryBuilder('f')
      .leftJoin(
        CoupleFurniture,
        'cf',
        'cf.furnitureId = f.id AND cf.coupleId = :coupleId',
        { coupleId: couple.id },
      )
      .where('f.id = :furnitureId', { furnitureId })
      .select([
        'f.id                AS "furnitureId"',
        'f.name              AS "name"',
        'f.description       AS "description"',
        'f.price             AS "price"',
        'f.s3ImageUrl        AS "s3ImageUrl"',
        'f.s3PreviewImageUrl AS "s3PreviewImageUrl"',
        'f.category          AS "category"',
        'f.zIndex            AS "zIndex"',
        'cf.id               AS "coupleFurnitureId"',
        'cf.isPlaced         AS "isPlaced"',
      ])
      .orderBy('f.zIndex', 'ASC')
      .getRawOne();

    return {
      furnitureId: row.furnitureId,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      s3ImageUrl: row.s3ImageUrl,
      s3PreviewImageUrl: row.s3PreviewImageUrl,
      category: row.category,
      isOwned: !!row.coupleFurnitureId,
      coupleFurnitureId: row.coupleFurnitureId ?? null,
      isPlaced: row.coupleFurnitureId ? !!row.isPlaced : false,
      zIndex: row.coupleFurnitureId
        ? row.zIndex !== null
          ? Number(row.zIndex)
          : null
        : null,
    };
  }

  async purchase(
    memberId: string,
    furnitureId: string,
  ): Promise<{
    coupleFurnitureId: string;
  }> {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BadRequestException('Notfound couple');
    }

    return this.dataSource.transaction(async (manager) => {
      const furniture = await manager
        .getRepository(Furniture)
        .findOneBy({ id: furnitureId });
      if (!furniture) {
        throw new BadRequestException('Invalid furniture id');
      }

      const coupleFurnitureRepo = manager.getRepository(CoupleFurniture);
      const existing = await coupleFurnitureRepo.findOne({
        where: { couple: { id: couple.id }, furniture: { id: furniture.id } },
      });
      if (existing) {
        throw new ConflictException('Already owned');
      }

      if (couple.point < furniture.price) {
        throw new BadRequestException('Not enough points');
      }
      couple.point -= furniture.price;
      await manager.getRepository(Couple).save(couple);

      const coupleFurniture = coupleFurnitureRepo.create({
        couple: { id: couple.id } as Couple,
        furniture: { id: furniture.id } as Furniture,
      });
      await coupleFurnitureRepo.save(coupleFurniture);

      return {
        coupleFurnitureId: coupleFurniture.id,
      };
    });
  }

  async updatePlacement(
    memberId: string,
    furniturePlacementDtos: FurniturePlacementDto[],
  ) {
    const couple = await this.membersService.findCoupleByMember(memberId);
    if (!couple) {
      throw new BadRequestException('Notfound couple');
    }

    return this.dataSource.transaction(async (manager) => {
      const coupleFurnitureRepo = manager.getRepository(CoupleFurniture);
      const updated: FurniturePlacementDto[] = [];

      for (const dto of furniturePlacementDtos) {
        const coupleFurniture = await coupleFurnitureRepo.findOne({
          where: { id: dto.coupleFurnitureId, couple: { id: couple.id } },
          relations: ['couple'],
        });
        if (!coupleFurniture) {
          throw new BadRequestException(
            `Invalid or unauthorized coupleFurnitureId ${dto.coupleFurnitureId}`,
          );
        }

        coupleFurniture.isPlaced = dto.isPlaced;
        await coupleFurnitureRepo.save(coupleFurniture);
        updated.push(dto);
      }

      return updated;
    });
  }
}
