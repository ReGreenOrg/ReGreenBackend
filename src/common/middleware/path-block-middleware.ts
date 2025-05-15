import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PathBlockMiddleware implements NestMiddleware {
  private readonly blockedPatterns = [
    /^\/\.env/,
    /^\/\.git/,
    /^\/config/,
    /^\/admin/,
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.originalUrl;

    if (!path.startsWith('/api')) {
      return res.status(404).end();
    }

    if (this.blockedPatterns.some((re) => re.test(path))) {
      return res.status(404).end();
    }
    next();
  }
}
