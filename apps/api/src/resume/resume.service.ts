import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SingletonContentStore } from '../common/singleton-content/singleton-content.store';

@Injectable()
export class ResumeService {
  private readonly store: SingletonContentStore;

  constructor(prisma: PrismaService) {
    this.store = new SingletonContentStore(prisma.resume, 'Resume');
  }

  getResume() {
    return this.store.get();
  }

  updateResume(content: Prisma.InputJsonObject) {
    return this.store.update(content);
  }
}
