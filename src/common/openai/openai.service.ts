import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { EcoVerificationType } from '../../domain/eco-verification/constant/eco-verification-type.enum';
import { ECO_PROMPTS } from './constant/eco-verification-prompt';
import { BusinessException } from '../exception/business-exception';
import { ErrorType } from '../exception/error-code.enum';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(private readonly cs: ConfigService) {
    this.openai = new OpenAI({ apiKey: cs.get<string>('OPENAI_API_KEY') });
  }

  async verifyImageByType(imageUrl: string, type: EcoVerificationType) {
    const systemPrompt = this.getPromptByType(type);

    let choice: OpenAI.ChatCompletion.Choice;
    try {
      const res = await this.openai.chat.completions.create({
        model: <string>this.cs.get<string>('OPENAI_MODEL'),
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Does this photo satisfy the mission? Answer in JSON.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'auto' },
              },
            ],
          },
        ],
      });
      choice = res.choices[0];
    } catch (e) {
      console.error('OpenAI API error', e);
      throw new BusinessException(ErrorType.VISION_SERVICE_UNAVAILABLE);
    }

    const content = choice?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new BusinessException(ErrorType.INVALID_VISION_RESPONSE);
    }

    const hasValidShape = (
      v: unknown,
    ): v is { isValid: boolean; reason: string } =>
      typeof v === 'object' &&
      v !== null &&
      'isValid' in v &&
      typeof (v as any).isValid === 'boolean' &&
      'reason' in v &&
      typeof (v as any).reason === 'string';

    const parsed = JSON.parse(content);
    if (!hasValidShape(parsed)) {
      throw new BusinessException(ErrorType.VISION_SCHEMA_MISMATCH);
    }

    return parsed;
  }

  getPromptByType(type: EcoVerificationType): string {
    const prompt = ECO_PROMPTS[type];
    if (!prompt) {
      throw new Error(`Unsupported EcoVerificationType: ${type}`);
    }
    return prompt;
  }
}
