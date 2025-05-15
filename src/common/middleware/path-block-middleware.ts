import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PathBlockMiddleware implements NestMiddleware {
  private readonly blockedPatterns = [
    /^\/\.env/,
    /^\/\.git/,
    /^\/config/,
    /^\/admin/,
  ];

  use(req: Request, res: Response, next: NextFunction) {
    if (this.blockedPatterns.some((re) => re.test(req.path))) {
      return res.status(404).end();
    }
    next();
  }
}
