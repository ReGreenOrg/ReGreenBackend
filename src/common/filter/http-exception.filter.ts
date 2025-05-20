import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscordWebhookService } from '../discord/discord-webhook.service';
import { BusinessException } from '../exception/business-exception';
import { ERROR_META } from '../exception/error-meta';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly discord: DiscordWebhookService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const isBusinessException = exception instanceof BusinessException;
    const status: number = isHttpException
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? (exception as HttpException).getResponse()
      : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : JSON.stringify(exceptionResponse, null, 2);

    console.error(`[${request.method}] ${request.url} →`, exception);

    await this.discord.sendError({
      title: `[${status}] ${request.method} ${request.url}`,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const payload: Record<string, any> = {
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (isBusinessException) {
      const { message, errorNumber } = exception as BusinessException;
      response.status(status).json({
        code: errorNumber,
        message: message,
        ...payload,
      });
    } else {
      response.status(status).json({
        code: ERROR_META.INTERNAL_SERVER_ERROR.code,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exceptionResponse,
        ...payload,
      });
    }
  }
}
