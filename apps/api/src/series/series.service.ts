import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto';
import { generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.series.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        posts: {
          where: { published: true },
          orderBy: { seriesOrder: 'asc' },
          select: { id: true, title: true, slug: true, seriesOrder: true },
        },
        _count: {
          select: {
            posts: { where: { published: true } },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const series = await this.prisma.series.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { published: true },
          orderBy: { seriesOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            seriesOrder: true,
            createdAt: true,
          },
        },
      },
    });

    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  async findById(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { seriesOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            seriesOrder: true,
          },
        },
      },
    });

    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  async create(dto: CreateSeriesDto) {
    const slug = await generateUniqueSlug(dto.title, async (s) => {
      const existing = await this.prisma.series.findUnique({ where: { slug: s } });
      return !!existing;
    });

    return this.prisma.series.create({
      data: { ...dto, slug },
      include: { posts: true },
    });
  }

  async update(id: string, dto: UpdateSeriesDto) {
    await this.findById(id);

    const data: Record<string, unknown> = { ...dto };

    if (dto.title) {
      const slug = await generateUniqueSlug(dto.title, async (s) => {
        const existing = await this.prisma.series.findUnique({ where: { slug: s } });
        return !!existing && existing.id !== id;
      });

      data.slug = slug;
    }

    return this.prisma.series.update({
      where: { id },
      data,
      include: { posts: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.$transaction(async (prisma) => {
      await prisma.post.updateMany({
        where: { seriesId: id },
        data: { seriesId: null, seriesOrder: null },
      });

      return prisma.series.delete({ where: { id } });
    });
  }

  async updatePostOrder(id: string, postIds: number[]) {
    await this.findById(id);

    if (!postIds || postIds.length === 0) {
      return this.findById(id);
    }

    const transactionOps = [
      // 시리즈에서 제거된 포스트의 연결을 해제합니다.
      this.prisma.post.updateMany({
        where: { seriesId: id, NOT: { id: { in: postIds } } },
        data: { seriesId: null, seriesOrder: null },
      }),
      // 시리즈에 포함된 포스트들의 순서를 업데이트합니다.
      ...postIds.map((postId, index) =>
        this.prisma.post.update({
          where: { id: postId },
          data: { seriesId: id, seriesOrder: index + 1 },
        })
      ),
    ];

    await this.prisma.$transaction(transactionOps);

    return this.findById(id);
  }
}
