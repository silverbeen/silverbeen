import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateShareLinkDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['RESUME', 'PORTFOLIO'])
  type: 'RESUME' | 'PORTFOLIO';

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
