import { IsArray, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserMetadataDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

class SupabaseUserDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserMetadataDto)
  user_metadata?: UserMetadataDto;
}

export class SyncUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupabaseUserDto)
  users: SupabaseUserDto[];
}
