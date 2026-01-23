import { IsObject, IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdatePortfolioDto {
  @IsObject()
  @IsNotEmpty()
  content: Prisma.InputJsonValue;
}
