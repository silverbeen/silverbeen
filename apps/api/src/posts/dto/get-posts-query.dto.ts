import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostsQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
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
}
