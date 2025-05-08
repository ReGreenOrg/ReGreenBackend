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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly reflector: Reflector) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Nest SystemException → stack 포함, 나머진 감춤
    const errorMsg = isHttp
      ? (exception as HttpException).message
      : 'Internal server error';

    // 로깅 (winston / pino 써도 됨)
    console.error(`[${request.method}] ${request.url} →`, exception);

    response.status(status).json({
      statusCode: status,
      message: errorMsg,
      error: isHttp ? (exception as HttpException).name : 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
