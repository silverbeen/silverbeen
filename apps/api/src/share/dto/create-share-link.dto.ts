import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ShareType } from '@prisma/client';

export class CreateShareLinkDto {
  @IsEnum(ShareType)
  type: ShareType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
