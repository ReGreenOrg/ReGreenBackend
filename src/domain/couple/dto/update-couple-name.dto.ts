import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UpdateCoupleNameDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 12, {
    message:
      'The name must be at least $constraint1 characters and at most $constraint2 characters. House name',
  })
  @Matches(/^[가-힣a-zA-Z0-9 ]+$/, {
    message: 'The name can only contain Korean, English, numbers, and spaces.',
  })
  name: string;
}
