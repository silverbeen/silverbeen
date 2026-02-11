import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDailyStatsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days: number = 30;
}

export class GetTopPostsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
