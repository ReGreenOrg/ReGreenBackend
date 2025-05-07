import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello() {
    const port = this.configService.get<number>('PORT', 4000);
    return {
      port,
    };
  }
}
