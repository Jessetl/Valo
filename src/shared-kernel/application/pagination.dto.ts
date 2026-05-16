import { IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export class PaginatedResponse<T> {
  data!: T[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
