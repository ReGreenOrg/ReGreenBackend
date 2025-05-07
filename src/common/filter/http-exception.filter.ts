// src/common/filters/http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { DomainCode } from '../constant/domain-code.constant';
import { API_DOMAIN_KEY } from '../decorators/api-domain-decorator';
import { CommonResponseDto } from '../dto/common.response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly reflector: Reflector) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // ① handler / class 는 switchToHttp 전에 빼내야 합니다
    const handler = (host as any).getHandler?.();
    const clazz = (host as any).getClass?.();

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    /* ---------- 상태 코드 ---------- */
    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    /* ---------- 도메인 ---------- */
    const domain: DomainCode =
      this.reflector.get<DomainCode>(API_DOMAIN_KEY, handler) ??
      this.reflector.get<DomainCode>(API_DOMAIN_KEY, clazz) ??
      DomainCode.NONE;

    const body: CommonResponseDto = {
      code: domain * 100 + (status % 100),
      message: this.extractMessage(exception),
      data: null,
    };

    res.status(status).json(body);
  }

  private extractMessage(e: unknown): string {
    if (e instanceof HttpException) {
      const r = e.getResponse() as any;
      return typeof r === 'string'
        ? r
        : Array.isArray(r?.message)
          ? r.message.join(', ')
          : (r?.message ?? e.message);
    }
    return 'Internal server error';
  }
}
