import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { tz } from '../utils/date-util';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly log = new Logger('REQ');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const host = req.headers.host;
    const { method, originalUrl: url } = req;
    const start = tz().millisecond();

    return next.handle().pipe(
      tap(() => {
        const ms = tz().millisecond() - start;
        this.log.log(`${host} ${method} ${url} +${ms}ms`);
      }),
    );
  }
}
