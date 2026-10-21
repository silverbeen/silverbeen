import { IsObject, IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateResumeDto {
  // IsObject는 배열과 null을 거부함
  @IsObject()
  @IsNotEmpty()
  content: Prisma.InputJsonObject;
}
