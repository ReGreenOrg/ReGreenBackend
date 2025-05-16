import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import helmet from 'helmet';
import { DiscordWebhookService } from './common/discord/discord-webhook.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.use(helmet());

  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);
  const discordService = app.get(DiscordWebhookService);

  app.useGlobalFilters(new HttpExceptionFilter(discordService));
  app.useGlobalInterceptors(new SuccessInterceptor(reflector));
  app.useGlobalInterceptors(new RequestLoggerInterceptor());

  app.enableCors({
    origin: [
      configService.get<string>('FRONT_URL'),
      'https://wooimi.kro.kr',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  const port = configService.get<number>('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
