import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoupleService } from './couple.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CoupleCodeDto } from './dto/couple-code.dto';
import { CoupleDto } from './dto/couple.dto';
import { RequestMember } from '../../common/dto/request-user.dto';
import { UpdateCoupleNameDto } from './dto/update-couple-name.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';
import { Public } from '../auth/decorator/public.dacorator';
import { CouplePhoto } from './entities/couple-photo.entity';
import { CoupleRankingService } from './couple-ranking.service';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { RankingDto } from './dto/ranking.dto';

@Controller('couples')
@UseGuards(JwtAccessGuard)
export class CoupleController {
  constructor(
    private readonly coupleService: CoupleService,
    private readonly coupleRankingService: CoupleRankingService,
  ) {}

  @Get('code')
  async createCode(@Req() req: RequestMember): Promise<CoupleCodeDto> {
    return await this.coupleService.generateCode(req.user.memberId);
  }

  @Post('join')
  async joinCouple(
    @Req() req: RequestMember,
    @Body() coupleCodeDto: CoupleCodeDto,
  ): Promise<void> {
    await this.coupleService.joinWithCode(
      req.user.memberId,
      coupleCodeDto.code,
    );
  }

  @Get('my')
  async getMyCouple(@Req() req: RequestMember): Promise<CoupleDto | null> {
    return await this.coupleService.findByMemberId(req.user.memberId);
  }

  @Delete('my')
  async breakup(@Req() req: RequestMember): Promise<void> {
    await this.coupleService.breakup(req.user.memberId);
  }

  @Patch('my/name')
  async updateName(
    @Req() req: RequestMember,
    @Body() dto: UpdateCoupleNameDto,
  ): Promise<void> {
    await this.coupleService.updateName(req.user.memberId, dto.name);
  }

  @Post('my/image')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Req() req: RequestMember,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (!file) {
      throw new BusinessException(ErrorType.INVALID_FILE_FORMAT);
    }
    await this.coupleService.updateImage(req.user.memberId, file);
  }

  @Public()
  @Post('my/photos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CouplePhoto> {
    if (!file) {
      throw new BusinessException(ErrorType.INVALID_FILE_FORMAT);
    }
    return await this.coupleService.uploadPhoto(file);
  }

  @Get('code/:code/nickname')
  async getIssuerNicknameByCoupleCode(
    @Param('code') code: string,
  ): Promise<{ nickname: string }> {
    return await this.coupleService.getIssuerNickname(code);
  }

  @Get('rankings')
  async getRankings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ): Promise<PaginatedDto<RankingDto>> {
    return this.coupleRankingService.getRankings(page, limit);
  }
}
