import {
  Controller,
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
import { EcoVerificationService } from './eco-verification.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';
import { EcoVerificationResponseDto } from './dto/eco-verification-response.dto';
import { MemberEcoVerificationSummaryResponseDto } from './dto/member-eco-verification-summary-response.dto';
import { PaginatedDto } from '../../common/dto/paginated.dto';
import { MemberEcoVerificationResponseDto } from './dto/member-eco-verification-response.dto';
import { RequestMember } from '../../common/dto/request-user.dto';

@Controller('eco-verifications')
@UseGuards(JwtAccessGuard)
export class EcoVerificationController {
  constructor(
    private readonly ecoVerificationService: EcoVerificationService,
  ) {}

  @Get()
  async getEcoVerifications(): Promise<EcoVerificationResponseDto[]> {
    return this.ecoVerificationService.getEcoVerifications();
  }

  @Post('easter-egg')
  async easterEgg(@Req() req: RequestMember): Promise<void> {
    await this.ecoVerificationService.easterEgg(req.user.memberId);
  }

  @Post(':ecoVerificationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: RequestMember,
    @UploadedFile() file: Express.Multer.File,
    @Param('ecoVerificationId') ecoVerificationId: string,
  ): Promise<MemberEcoVerificationSummaryResponseDto> {
    if (!file) {
      throw new BusinessException(ErrorType.INVALID_FILE_FORMAT);
    }

    return await this.ecoVerificationService.verifyWithImage(
      req.user.memberId,
      ecoVerificationId,
      file,
    );
  }

  @Post('my/:memberEcoVerificationId/share')
  async share(
    @Req() req: RequestMember,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
  ): Promise<void> {
    await this.ecoVerificationService.giveExtraPoints(
      req.user.memberId,
      memberEcoVerificationId,
    );
  }

  @Patch('my/:memberEcoVerificationId/request-review')
  async requestReview(
    @Req() req: RequestMember,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
  ): Promise<void> {
    await this.ecoVerificationService.requestReview(
      req.user.memberId,
      memberEcoVerificationId,
    );
  }

  @Get('my')
  async listMyVerifications(
    @Req() req: RequestMember,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<PaginatedDto<MemberEcoVerificationResponseDto>> {
    return await this.ecoVerificationService.getMyVerifications(
      req.user.memberId,
      page,
      limit,
    );
  }

  @Get('my/couple')
  async getVerificationsWithYesterday(
    @Req() req: RequestMember,
    @Query('date') date?: string,
  ) {
    return await this.ecoVerificationService.getCoupleVerificationsWithYesterday(
      req.user.memberId,
      date,
    );
  }

  @Get('my/:memberEcoVerificationId')
  async getMyVerification(
    @Req() req: RequestMember,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
  ): Promise<MemberEcoVerificationResponseDto> {
    return await this.ecoVerificationService.getMyVerificationDetail(
      req.user.memberId,
      memberEcoVerificationId,
    );
  }
}
