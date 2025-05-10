import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import base64url from 'base64url';
import { createHmac, randomUUID } from 'crypto';

@Injectable()
export class StateService {
  private readonly secret: string;

  constructor(private readonly cs: ConfigService) {
    this.secret = cs.get<string>('STATE_SECRET', { infer: true })!;
  }

  make(returnUrl: string): string {
    const payload = base64url.encode(returnUrl);
    const nonce = randomUUID();
    const sig = this.sign(`${payload}.${nonce}`);
    return `${payload}.${nonce}.${sig}`;
  }

  parse(state: string): { returnUrl: string; nonce: string } {
    const [payload, nonce, sig] = state.split('.');
    if (sig !== this.sign(`${payload}.${nonce}`))
      throw new Error('Invalid state signature');
    return { returnUrl: base64url.decode(payload), nonce };
  }

  private sign(text: string) {
    return createHmac('sha256', this.secret).update(text).digest('base64url');
  }
}
