import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto';
import { persistWithUniqueSlug, slugExistsCheck } from '../common/utils/slug.util';

/** 어드민 응답용: 비공개(draft) 글 포함 */
const adminSeriesInclude = {
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
} satisfies Prisma.SeriesInclude;

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

  /** 공개 조회: 공개된 글만 포함 */
  async findById(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        posts: {
          where: { published: true },
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
    return persistWithUniqueSlug(dto.title, this.slugExists(), (slug) =>
      this.prisma.series.create({
        data: { ...dto, slug },
        include: { posts: true },
      }),
    );
  }

  async update(id: string, dto: UpdateSeriesDto) {
    await this.assertExists(id);

    const persist = (slug?: string) =>
      this.prisma.series.update({
        where: { id },
        data: { ...dto, slug } satisfies Prisma.SeriesUpdateInput,
        include: { posts: true },
      });

    if (!dto.title) {
      return persist();
    }

    return persistWithUniqueSlug(dto.title, this.slugExists(id), persist);
  }

  async delete(id: string) {
    await this.assertExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.post.updateMany({
        where: { seriesId: id },
        data: { seriesId: null, seriesOrder: null },
      });

      return tx.series.delete({ where: { id } });
    });
  }

  /**
   * 시리즈 글 목록/순서 변경 (어드민)
   * postIds가 빈 배열이면 시리즈의 모든 글 연결을 해제
   */
  async updatePostOrder(id: string, postIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertExists(id, tx);

      // 시리즈에서 제거된 포스트의 연결을 해제합니다. (빈 배열이면 전체 해제)
      await tx.post.updateMany({
        where: { seriesId: id, NOT: { id: { in: postIds } } },
        data: { seriesId: null, seriesOrder: null },
      });

      // 시리즈에 포함된 포스트들의 순서를 업데이트합니다.
      await Promise.all(
        postIds.map((postId, index) =>
          tx.post.update({
            where: { id: postId },
            data: { seriesId: id, seriesOrder: index + 1 },
          }),
        ),
      );

      return tx.series.findUniqueOrThrow({
        where: { id },
        include: adminSeriesInclude,
      });
    });
  }

  private async assertExists(id: string, client: Prisma.TransactionClient = this.prisma) {
    const series = await client.series.findUnique({ where: { id }, select: { id: true } });
    if (!series) throw new NotFoundException('Series not found');
  }

  private slugExists(excludeId?: string) {
    return slugExistsCheck(
      (slug) => this.prisma.series.findUnique({ where: { slug }, select: { id: true } }),
      excludeId,
    );
  }
}
