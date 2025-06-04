import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { DiscordWebhookService } from './common/discord/discord-webhook.service';
import { PathBlockMiddleware } from './common/middleware/path-block-middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  process.env.TZ = 'Asia/Seoul';
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      configService.get<string>('FRONT_URL'),
      configService.get<string>('FRONT_URL_'),
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.use((req, res, next) => new PathBlockMiddleware().use(req, res, next));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const discordService = app.get(DiscordWebhookService);
  app.useGlobalFilters(new HttpExceptionFilter(discordService));
  app.useGlobalInterceptors(new SuccessInterceptor());

  app.useGlobalInterceptors(new RequestLoggerInterceptor());

  const port = configService.get<number>('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
