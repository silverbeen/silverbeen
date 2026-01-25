import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortfolio() {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: 'main' },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return portfolio.content;
  }

  async updatePortfolio(content: Prisma.InputJsonValue) {
    return this.prisma.portfolio.upsert({
      where: { id: 'main' },
      update: { content },
      create: { id: 'main', content },
    });
  }
}
