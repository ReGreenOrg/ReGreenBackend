import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Member } from '../member/entities/member.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Member])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
