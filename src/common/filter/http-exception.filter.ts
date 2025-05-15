import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscordWebhookService } from '../discord/discord-webhook.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly discord: DiscordWebhookService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // exception.getResponse() 는 string | object
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    // 에러 메시지/페이로드 직렬화
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : JSON.stringify(exceptionResponse, null, 2);

    // 콘솔로도 로깅
    console.error(`[${request.method}] ${request.url} →`, exception);

    // Discord 웹훅 전송
    await this.discord.sendError({
      title: `[${status}] ${request.method} ${request.url}`,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // 클라이언트 응답
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // exceptionResponse 가 string 이면 그걸, object 면 object 그대로
      error:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exceptionResponse,
    });
  }
}
