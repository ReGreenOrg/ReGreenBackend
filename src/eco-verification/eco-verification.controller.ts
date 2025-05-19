import {
  BadRequestException,
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
import { ApiDomain } from '../common/decorators/api-domain-decorator';
import { DomainCode } from '../common/constant/domain-code.constant';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('eco-verifications')
@UseGuards(JwtAccessGuard)
@ApiDomain(DomainCode.ECO_VERIFICATION)
export class EcoVerificationController {
  constructor(
    private readonly ecoVerificationService: EcoVerificationService,
  ) {}

  @Get()
  async getEcoVerifications() {
    return this.ecoVerificationService.getEcoVerifications();
  }

  @Post(':ecoVerificationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: any,
    @UploadedFile() file: Express.MulterS3.File,
    @Param('ecoVerificationId') ecoVerificationId: string,
  ) {
    if (!file) {
      throw new BadRequestException('The file was not transferred.');
    }

    return await this.ecoVerificationService.submitWithPhoto(
      req.user.memberId,
      ecoVerificationId,
      file.location,
    );
  }

  @Patch('my/:memberEcoVerificationId/link')
  async uploadLink(
    @Req() req: any,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
    @Body('url') url: string,
  ) {
    await this.ecoVerificationService.submitLink(
      req.user.memberId,
      memberEcoVerificationId,
      url,
    );
  }

  @Get('my')
  async listMyVerifications(
    @Req() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return await this.ecoVerificationService.getMyVerifications(
      req.user.memberId,
      page,
      limit,
    );
  }

  @Get('my/:memberEcoVerificationId')
  async getMyVerification(
    @Req() req: any,
    @Param('memberEcoVerificationId') memberEcoVerificationId: string,
  ) {
    return await this.ecoVerificationService.getMyVerificationDetail(
      req.user.memberId,
      memberEcoVerificationId,
    );
  }
}
