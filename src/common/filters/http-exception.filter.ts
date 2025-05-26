import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exception/business-exception';
import { ERROR_META } from '../exception/error-meta';
import { DiscordWebhookService } from '../discord/discord-webhook.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly discordService: DiscordWebhookService) {}

  private readonly LOGGER = new Logger('EXCEPTION FILTER');

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = ERROR_META.INVALID_REQUEST.status;
    let code = ERROR_META.INVALID_REQUEST.code;
    let message = ERROR_META.INVALID_REQUEST.message;

    this.LOGGER.error(
      exception,
      `[${request.method}] ${request.url} → ${status}`,
    );

    /* business */
    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      code = exception.errorCode;
      message = exception.message;
      /* http */
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
      /* etc */
    } else if (exception instanceof Error) {
      status = ERROR_META.INTERNAL_SERVER_ERROR.status;
      code = ERROR_META.INTERNAL_SERVER_ERROR.code;
      message = exception.message;
    }

    await this.discordService.sendError({
      title: `[${status}] ${request.method} ${request.url}`,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const payload = {
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json({ code, message, ...payload });
  }
}
