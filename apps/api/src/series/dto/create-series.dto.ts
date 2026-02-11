import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
