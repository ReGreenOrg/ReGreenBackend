import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RedisModule } from '../../common/redis/redis.module';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.register({}),
    RedisModule,
    MemberModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
  ],
  exports: [JwtAccessGuard],
})
export class AuthModule {}
