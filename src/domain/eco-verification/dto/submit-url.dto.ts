import { IsNotEmpty, IsUrl } from 'class-validator';

export class SubmitUrlDto {
  @IsNotEmpty()
  @IsUrl(
    { require_tld: true, protocols: ['http', 'https'] },
    { message: 'invalid url format' },
  )
  url: string;
}
