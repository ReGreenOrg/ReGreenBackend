import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { CoupleModule } from './couple/couple.module';
import { FurnitureModule } from './furniture/furniture.module';
import { CoupleFurnitureModule } from './couple-furniture/couple-furniture.module';
import { EcoVerificationModule } from './eco-verification/eco-verification.module';
import { RedisModule } from './redis/redis.module';
import * as Joi from '@hapi/joi';
import { FurnitureSeedService } from './furniture/constant/furniture-seed-service';
import { MemberEcoVerificationModule } from './member-eco-verification/member-eco-verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        PORT: Joi.number().required(),

        FRONT_URL: Joi.string().required(),

        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASS: Joi.string().required(),
        MYSQL_NAME: Joi.string().required(),

        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CLIENT_SECRET: Joi.string().required(),
        KAKAO_REDIRECT_URI: Joi.string().required(),

        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES: Joi.number().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES: Joi.number().required(),

        REDIS_URL: Joi.string().required(),
        REDIS_TTL: Joi.number().required(),

        STATE_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MemberModule,
    AuthModule,
    CoupleModule,
    FurnitureModule,
    CoupleFurnitureModule,
    EcoVerificationModule,
    RedisModule,
    MemberEcoVerificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly seed: FurnitureSeedService) {}

  async onApplicationBootstrap() {
    await this.seed.sync();
  }
}
