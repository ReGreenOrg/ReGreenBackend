import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);

  app.useGlobalFilters(new HttpExceptionFilter(reflector));
  app.useGlobalInterceptors(new SuccessInterceptor(reflector));

  // CORS 설정 (필요 시 추가)
  app.enableCors({
    origin: [],
    credentials: false,
  });

  const port = configService.get<number>('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
