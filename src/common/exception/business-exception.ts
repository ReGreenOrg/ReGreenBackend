import { HttpException } from '@nestjs/common';
import { ErrorType } from './error-code.enum';
import { ERROR_META } from './error-meta';

export class BusinessException extends HttpException {
  readonly errorType: ErrorType;
  readonly errorCode: number;

  constructor(errorType: ErrorType, overrideMessage?: string) {
    const { status, code, message } = ERROR_META[errorType];
    super(
      {
        errorType,
        errorCode: code,
        message: overrideMessage ?? message,
      },
      status,
    );
    this.errorType = errorType;
    this.errorCode = code;
  }
}
