import { IsNotEmpty } from 'class-validator';

export class CoupleCodeDto {
  @IsNotEmpty()
  code: string;
}
