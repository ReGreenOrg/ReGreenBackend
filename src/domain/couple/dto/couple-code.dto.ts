import { IsString } from 'class-validator';

export class CoupleCodeDto {
  @IsString()
  code: string;
}
