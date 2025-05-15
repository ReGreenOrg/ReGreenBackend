import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordWebhookService {
  private readonly logger = new Logger(DiscordWebhookService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.webhookUrl = this.config.get<string>('DISCORD_WEBHOOK_URL', '');
  }

  async sendError(options: { title: string; message: string; stack?: string }) {
    if (!this.webhookUrl) {
      this.logger.warn(
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
          timestamp: new Date().toISOString(),
          fields: options.stack
            ? [{ name: 'Stack Trace', value: '```' + options.stack + '```' }]
            : [],
        },
      ],
    };

    try {
      await firstValueFrom(this.http.post(this.webhookUrl, payload));
    } catch (err) {
      this.logger.error('Failed to send error to Discord', err);
    }
  }
}
