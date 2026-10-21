import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SingletonContentStore } from '../common/singleton-content/singleton-content.store';

@Injectable()
export class PortfolioService {
  private readonly store: SingletonContentStore;

  constructor(prisma: PrismaService) {
    this.store = new SingletonContentStore(prisma.portfolio, 'Portfolio');
  }

  getPortfolio() {
    return this.store.get();
  }

  updatePortfolio(content: Prisma.InputJsonObject) {
    return this.store.update(content);
  }
}
