import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);

  app.useGlobalFilters(new HttpExceptionFilter(reflector));
  app.useGlobalInterceptors(new SuccessInterceptor(reflector));

  app.enableCors({
    origin: [configService.get<string>('FRONT_URL'), 'http://localhost:3000'],
    credentials: true,
  });

  const port = configService.get<number>('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
