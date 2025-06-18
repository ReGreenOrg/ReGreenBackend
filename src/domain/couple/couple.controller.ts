import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { MemberEcoVerificationSummaryResponseDto } from '../eco-verification/dto/member-eco-verification-summary-response.dto';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';

@Controller('couples')
@UseGuards(JwtAccessGuard)
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

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
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<void> {
    if (!file) {
      throw new BusinessException(ErrorType.INVALID_FILE_FORMAT);
    }
    await this.coupleService.updateImage(req.user.memberId, file.location);
  }

  @Get('code/:code/nickname')
  async getIssuerNicknameByCoupleCode(
    @Param('code') code: string,
  ): Promise<{ nickname: string }> {
    return await this.coupleService.getIssuerNickname(code);
  }
}
