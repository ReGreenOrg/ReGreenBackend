export interface CommonResponseDto<T = unknown> {
  code: number;
  message: string;
  data: T;
}