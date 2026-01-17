import { IsObject, IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateResumeDto {
  @IsObject()
  @IsNotEmpty()
  content: Prisma.InputJsonValue;
}
