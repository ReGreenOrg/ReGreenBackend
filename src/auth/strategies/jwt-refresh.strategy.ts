import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(cs: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['refreshToken'] ?? null;
        },
        // ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: cs.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: { sub: string; jti: string }): Promise<any> {
    return { memberId: payload.sub, jti: payload.jti };
  }
}
