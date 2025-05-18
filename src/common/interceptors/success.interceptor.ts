import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { CommonResponseDto } from '../dto/common.response.dto';
import { DomainCode } from '../constant/domain-code.constant';
import { API_DOMAIN_KEY } from '../decorators/api-domain-decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SuccessInterceptor<T>
  implements NestInterceptor<T, CommonResponseDto<T>>
{
  constructor(private readonly reflector: Reflector) {}

  // 파라미터 이름을 ctx 로 그대로 사용
  intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<CommonResponseDto<T>> {
    const req = ctx.switchToHttp().getRequest();
    if (req.originalUrl === '/api/env' || req.url === '/api/env') {
      return next.handle();
    }

    const domain =
      this.reflector.get<DomainCode>(API_DOMAIN_KEY, ctx.getHandler()) ??
      this.reflector.get<DomainCode>(API_DOMAIN_KEY, ctx.getClass()) ??
      DomainCode.NONE;

    return next.handle().pipe(
      map((data) => ({
        code: domain * 100 + 0,
        message: 'OK',
        data,
      })),
    );
  }
}
