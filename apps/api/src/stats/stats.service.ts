import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(page: string, postId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.dailyStats.upsert({
      where: { date_page: { date: today, page } },
      update: { views: { increment: 1 } },
      create: { date: today, page, postId, views: 1 },
    });
  }

  async getDailyStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await this.prisma.dailyStats.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }

    for (const stat of stats) {
      const key = new Date(stat.date).toISOString().split('T')[0];
      dailyMap.set(key, (dailyMap.get(key) || 0) + stat.views);
    }

    return Array.from(dailyMap.entries()).map(([date, views]) => ({ date, views }));
  }

  async getTopPosts(limit: number = 10) {
    return this.prisma.post.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        createdAt: true,
      },
    });
  }

  async getTagStats() {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: { select: { posts: true } },
        posts: {
          where: { published: true },
          select: { viewCount: true },
        },
      },
    });

    return tags
      .map((tag) => ({
        name: tag.name,
        postCount: tag._count.posts,
        totalViews: tag.posts.reduce((sum, p) => sum + p.viewCount, 0),
      }))
      .sort((a, b) => b.totalViews - a.totalViews);
  }

  async getOverview() {
    const [totalPosts, publishedPosts, totalViews, todayViews] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { published: true } }),
      this.prisma.post.aggregate({ _sum: { viewCount: true } }),
      this.getTodayViews(),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts: totalPosts - publishedPosts,
      totalViews: totalViews._sum.viewCount || 0,
      todayViews,
    };
  }

  private async getTodayViews() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.dailyStats.aggregate({
      where: { date: today },
      _sum: { views: true },
    });

    return result._sum.views || 0;
  }
}
