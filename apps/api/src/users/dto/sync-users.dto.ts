import { IsArray, IsEmail, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserMetadataDto {
  @IsOptional()
  @IsString()
  name?: string;
}

class AppMetadataDto {
  @IsOptional()
  @IsString()
  role?: string;
}

export class SupabaseUserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AppMetadataDto)
  app_metadata?: AppMetadataDto;

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
