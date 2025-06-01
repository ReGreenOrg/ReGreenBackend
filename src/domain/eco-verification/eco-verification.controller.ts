import {
  Body,
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
import { SubmitUrlDto } from './dto/submit-url.dto';

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

  @Post(':ecoVerificationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: RequestMember,
    @UploadedFile() file: Express.MulterS3.File,
    @Param('ecoVerificationId') ecoVerificationId: string,
  ): Promise<MemberEcoVerificationSummaryResponseDto> {
    if (!file) {
      throw new BusinessException(ErrorType.INVALID_FILE_FORMAT);
    }

    return await this.ecoVerificationService.verifyWithImage(
      req.user.memberId,
      ecoVerificationId,
      file.location,
    );
  }

  @Patch('my/:memberEcoVerificationId/link')
  async uploadLink(
    @Req() req: RequestMember,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
    @Body() urlDto: SubmitUrlDto,
  ): Promise<void> {
    await this.ecoVerificationService.submitLink(
      req.user.memberId,
      memberEcoVerificationId,
      urlDto.url,
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
    @Query('date') date: string,
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
