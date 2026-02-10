import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

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
        _count: { select: { posts: true } },
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
    const baseSlug = generateSlug(dto.title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.series.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return this.prisma.series.create({
      data: { ...dto, slug },
      include: { posts: true },
    });
  }

  async update(id: string, dto: UpdateSeriesDto) {
    await this.findById(id);

    const data: Record<string, unknown> = { ...dto };

    if (dto.title) {
      const baseSlug = generateSlug(dto.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await this.prisma.series.findUnique({ where: { slug } });
        if (!existing || existing.id === id) break;
        slug = `${baseSlug}-${counter++}`;
      }

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

    await this.prisma.post.updateMany({
      where: { seriesId: id },
      data: { seriesId: null, seriesOrder: null },
    });

    return this.prisma.series.delete({ where: { id } });
  }

  async updatePostOrder(id: string, postIds: number[]) {
    await this.findById(id);

    const updates = postIds.map((postId, index) =>
      this.prisma.post.update({
        where: { id: postId },
        data: { seriesId: id, seriesOrder: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findById(id);
  }
}
