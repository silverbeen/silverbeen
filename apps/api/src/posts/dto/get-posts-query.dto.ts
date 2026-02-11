import { IsOptional, IsInt, Min, IsString, IsIn, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostsQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['createdAt', 'viewCount', 'title'])
  sortBy?: 'createdAt' | 'viewCount' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
