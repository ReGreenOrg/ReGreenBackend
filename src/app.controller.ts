import { Controller, Get } from '@nestjs/common';
import * as process from 'node:process';

@Controller()
export class AppController {
  @Get('env')
  getHello() {
    return process.env.UPSTREAM_COLOR || 'local';
  }
}
