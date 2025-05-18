import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as process from 'node:process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('env')
  getHello() {
    return process.env.UPSTREAM_COLOR || 'local';
  }
}
