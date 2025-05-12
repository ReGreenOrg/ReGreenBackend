import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { Repository } from 'typeorm';
import { CoupleFurniture } from '../couple-furniture/entities/couple-furniture.entity';
import { MemberService } from '../member/member.service';
import { FurnitureDto } from './dto/furniture.dto';

@Injectable()
export class FurnitureService {
  constructor(
    @InjectRepository(Furniture)
    private readonly furnitureRepo: Repository<Furniture>,
    @InjectRepository(CoupleFurniture)
    private readonly cfRepo: Repository<CoupleFurniture>,
    private readonly membersService: MemberService,
  ) {}

  async getAll(memberId: string): Promise<FurnitureDto[]> {
    const coupleId = await this.membersService.findCoupleIdByMember(memberId);
    if (!coupleId) throw new BadRequestException('Couple not found');

    const rows = await this.furnitureRepo
      .createQueryBuilder('f')
      .leftJoin(
        CoupleFurniture,
        'cf',
        'cf.furnitureId = f.id AND cf.coupleId = :coupleId',
        { coupleId },
      )
      .select([
        'f.id                AS "furnitureId"',
        'f.name              AS "name"',
        'f.description       AS "description"',
        'f.price             AS "price"',
        'f.s3ImageUrl        AS "s3ImageUrl"',
        'f.category          AS "category"',
        'f.zIndex            AS "zIndex"',
        'cf.id               AS "coupleFurnitureId"',
        'cf.isPlaced         AS "isPlaced"',
      ])
      .orderBy('f.zIndex', 'ASC')
      .getRawMany<FurnitureDto>();

    return rows.map((row) => ({
      furnitureId: row.furnitureId,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      s3ImageUrl: row.s3ImageUrl,
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
    const coupleId = await this.membersService.findCoupleIdByMember(memberId);
    if (!coupleId) throw new BadRequestException('Couple not found');

    const row = <FurnitureDto>(
      await this.furnitureRepo
        .createQueryBuilder('f')
        .leftJoin(
          CoupleFurniture,
          'cf',
          'cf.furnitureId = f.id AND f.id = :furnitureId AND cf.coupleId = :coupleId',
          { furnitureId, coupleId },
        )
        .select([
          'f.id                AS "furnitureId"',
          'f.name              AS "name"',
          'f.description       AS "description"',
          'f.price             AS "price"',
          'f.s3ImageUrl        AS "s3ImageUrl"',
          'f.category          AS "category"',
          'f.zIndex            AS "zIndex"',
          'cf.id               AS "coupleFurnitureId"',
          'cf.isPlaced         AS "isPlaced"',
        ])
        .orderBy('f.zIndex', 'ASC')
        .getRawOne<FurnitureDto>()
    );

    return {
      furnitureId: row.furnitureId,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      s3ImageUrl: row.s3ImageUrl,
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
}
