import { AuthGuard } from '@nestjs/passport';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user, info) {
    if (info?.name === 'TokenExpiredError')
      throw new HttpException('Refresh expired', 419);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
