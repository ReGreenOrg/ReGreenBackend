import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
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
      throw new BadRequestException('파일이 전송되지 않았습니다.');
    }

    return await this.ecoVerificationService.submitWithPhoto(
      req.user.memberId,
      ecoVerificationId,
      file.location,
    );
  }

  // @Patch(':memberEcoVerificationId/status')
  // @Roles('admin')   // 관리자 권한 예시
  // async changeStatus(
  //   @Param('linkId') linkId: string,
  //   @Body('status', new ParseEnumPipe(VerificationStatus)) status: VerificationStatus,
  // ) {
  //   return this.ecoService.reviewAndReward(linkId, status);
  // }
}
