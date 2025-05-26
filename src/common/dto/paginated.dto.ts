export class PaginatedDto<TData> {
  total: number;
  limit: number;
  page: number;
  results: TData[];
}