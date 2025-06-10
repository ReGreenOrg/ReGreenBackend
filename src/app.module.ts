import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { MemberModule } from './domain/member/member.module';
import { AuthModule } from './domain/auth/auth.module';
import { CoupleModule } from './domain/couple/couple.module';
import { ItemModule } from './domain/item/item.module';
import { EcoVerificationModule } from './domain/eco-verification/eco-verification.module';
import { RedisModule } from './common/redis/redis.module';
import * as Joi from '@hapi/joi';
import { ItemSeedService } from './domain/item/constant/item-seed.service';
import { S3Module } from './common/s3/s3.module';
import { EcoVerificationSeedService } from './domain/eco-verification/constant/eco-verification-seed-service';
import { PathBlockMiddleware } from './common/middleware/path-block-middleware';
import { DiscordWebhookService } from './common/discord/discord-webhook.service';
import { HttpModule } from '@nestjs/axios';
import { OpenaiModule } from './common/openai/openai.module';
import { tz } from './common/utils/date-util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        PORT: Joi.number().required(),

        FRONT_URL: Joi.string().required(),
        FRONT_URL_: Joi.string().required(),

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

        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_ACCESS: Joi.string().required(),
        AWS_S3_SECRET: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),

        OPENAI_API_KEY: Joi.string().required(),
        OPENAI_MODEL: Joi.string().required(),

        STATE_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MemberModule,
    AuthModule,
    CoupleModule,
    ItemModule,
    EcoVerificationModule,
    RedisModule,
    S3Module,
    HttpModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [DiscordWebhookService],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  constructor(
    private readonly furnitureSeedService: ItemSeedService,
    private readonly ecoVerificationSeedService: EcoVerificationSeedService,
  ) {}

  async onApplicationBootstrap() {
    Logger.debug(`[CURRENT TIME] ${tz().format()}`);
    await this.furnitureSeedService.sync();
    await this.ecoVerificationSeedService.sync();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PathBlockMiddleware).forRoutes('*');
  }
}
