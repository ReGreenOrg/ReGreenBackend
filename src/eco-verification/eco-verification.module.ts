import { Module } from '@nestjs/common';
import { EcoVerificationService } from './eco-verification.service';
import { EcoVerificationController } from './eco-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcoVerification } from './entities/eco-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EcoVerification])],
  controllers: [EcoVerificationController],
  providers: [EcoVerificationService],
  exports: [EcoVerificationService],
})
export class EcoVerificationModule {}
