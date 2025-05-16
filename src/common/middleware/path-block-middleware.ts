import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

type RouteDef = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string | RegExp;
};

@Injectable()
export class PathBlockMiddleware implements NestMiddleware {
  private readonly allowed: RouteDef[] = [
    // Auth
    { method: 'POST', path: '/api/auth/kakao/login' },
    { method: 'POST', path: '/api/auth/refresh' },
    { method: 'POST', path: '/api/auth/logout' },
    { method: 'GET', path: '/api/auth/mylogin' },

    // Couple
    { method: 'POST', path: '/api/couples/code' },
    { method: 'POST', path: '/api/couples/join' },
    { method: 'GET', path: '/api/couples/my' },
    { method: 'DELETE', path: '/api/couples/my' },
    { method: 'GET', path: /^\/api\/couples\/code\/[^/]+\/nickname$/ },

    // Eco Verification
    { method: 'GET', path: '/api/eco-verifications' },
    {
      method: 'POST',
      path: /^\/api\/eco-verifications\/[^/]+$/,
    },
    {
      method: 'PATCH',
      path: /^\/api\/eco-verifications\/my\/[^/]+\/link$/,
    },
    { method: 'GET', path: '/api/eco-verifications/my' },
    { method: 'GET', path: /^\/api\/eco-verifications\/my\/[^/]+$/ },

    // Furniture
    { method: 'GET', path: '/api/furniture' },
    { method: 'GET', path: /^\/api\/furniture\/[^/]+$/ },
    { method: 'POST', path: /^\/api\/furniture\/[^/]+$/ },
    { method: 'PATCH', path: '/api/furniture' },

    // Member
    { method: 'GET', path: '/api/members/my' },
    { method: 'PATCH', path: '/api/members/my' },
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method as RouteDef['method'];
    const url = req.originalUrl.split('?')[0];

    if (!url.startsWith('/api')) {
      return res.status(HttpStatus.NOT_FOUND).end();
    }

    const ok = this.allowed.some((route) => {
      if (route.method !== method) return false;
      if (typeof route.path === 'string') {
        return route.path === url;
      } else {
        return route.path.test(url);
      }
    });

    /*
    "statusCode": 409,
    "timestamp": "2025-05-16T13:55:18.035Z",
    "path": "/api/couples/code",
    "error": "이미 커플에 속해 있어 코드를 발급할 수 없습니다."

     */
    if (!ok) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: `${method} ${url}`,
        message: '존재하지 않는 요청입니다.',
      });
    }

    next();
  }
}
