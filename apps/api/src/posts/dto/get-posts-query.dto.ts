import { IsOptional, IsInt, Min, Max, IsString, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['createdAt', 'viewCount', 'likeCount', 'title'])
  sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
