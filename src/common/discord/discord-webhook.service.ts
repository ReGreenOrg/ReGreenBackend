import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { tz } from '../utils/date-util';

@Injectable()
export class DiscordWebhookService {
  private readonly LOGGER = new Logger(DiscordWebhookService.name);
  private readonly WEBHOOK_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.WEBHOOK_URL = this.configService.get<string>(
      'DISCORD_WEBHOOK_URL',
      '',
    );
  }

  async sendError(options: { title: string; message: string; stack?: string }) {
    if (!this.WEBHOOK_URL) {
      this.LOGGER.warn(
        'No DISCORD_WEBHOOK_URL configured, skipping Discord alert',
      );
      return;
    }

    const payload = {
      embeds: [
        {
          title: options.title,
          description: options.message,
          color: 0xff0000,
          timestamp: tz().format('YYYY-MM-DD HH:mm:ss'),
          fields: options.stack
            ? [{ name: 'Stack Trace', value: '```' + options.stack + '```' }]
            : [],
        },
      ],
    };

    try {
      await firstValueFrom(this.httpService.post(this.WEBHOOK_URL, payload));
    } catch (err) {
      this.LOGGER.error('Failed to send error to Discord', err);
    }
  }
}
