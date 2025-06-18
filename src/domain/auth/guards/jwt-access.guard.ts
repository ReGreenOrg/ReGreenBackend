import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { BusinessException } from '../../../common/exception/business-exception';
import { ErrorType } from '../../../common/exception/error-code.enum';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constant/jwt-public-key';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new BusinessException(ErrorType.ACCESS_TOKEN_EXPIRED);
    }
    if (err) throw err;
    if (!user) {
      throw new BusinessException(ErrorType.INVALID_ACCESS_TOKEN);
    }
    return user;
  }
}
