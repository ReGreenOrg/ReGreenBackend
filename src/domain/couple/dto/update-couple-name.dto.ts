import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UpdateCoupleNameDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 10, {
    message:
      'The name must be at least $constraint1 characters and at most $constraint2 characters. House name',
  })
  @Matches(/^[\p{L}\p{N}\p{P}\p{S} ]+$/u, {
    message:
      'The name can contain any letters, numbers, punctuation, symbols, and spaces.',
  })
  name: string;
}
