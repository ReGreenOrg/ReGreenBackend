import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PathBlockMiddleware implements NestMiddleware {
  private readonly blockedPatterns = [
    /^\/api\/\.\w+/, // `/api/.env`, `/api/.gitignore` 등
    /^\/\.(env|git|htaccess|idea|DS_Store)/, // 숨김 파일
    /^\/config\.(php|json|yaml|yml)/, // config.php, config.yaml 등
    /^\/phpinfo\.php$/, // PHP info
    /^\/composer\.(json|lock)$/, // PHP composer 파일
    /^\/(vendor|node_modules)\//, // 패키지 디렉토리
    /^\/(wp-admin|wp-login\.php|xmlrpc\.php)/, // 워드프레스 기본 경로
    /^\/(pma|phpmyadmin|adminer)\//, // DB 관리 툴
    /^\/(server-status|server-info)/, // Apache 서버 상태
    /^\/\w+\.bak$/, // 백업파일
    /^\/\.svn\//, // SVN
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
