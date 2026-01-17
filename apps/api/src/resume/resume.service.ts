import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async getResume() {
    const resume = await this.prisma.resume.findUnique({
      where: { id: 'main' },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume.content;
  }

  async updateResume(content: Prisma.InputJsonValue) {
    return this.prisma.resume.upsert({
      where: { id: 'main' },
      update: { content },
      create: { id: 'main', content },
    });
  }
}
