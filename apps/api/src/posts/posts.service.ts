import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { persistWithUniqueSlug, slugExistsCheck } from '../common/utils/slug.util';
import { isPrismaError } from '../common/utils/prisma-error.util';
import { StatsService } from '../stats/stats.service';

/** 공개 상세 조회용 include (시리즈의 공개 글 목록 포함) */
const publicPostInclude = {
  tags: true,
  series: {
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
  },
} satisfies Prisma.PostInclude;

const postWithRelationsInclude = { tags: true, series: true } satisfies Prisma.PostInclude;

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    tag?: string;
    sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'title';
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const order = options?.order || 'desc';

    const where: Prisma.PostWhereInput = { published: true };

    if (options?.tag) {
      where.tags = {
        some: { name: options.tag },
      };
    }

    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { content: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: postWithRelationsInclude,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllAdmin(authorId: string) {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: postWithRelationsInclude,
    });
  }

  /** 공개 조회: 공개된 글만 (draft는 404) */
  async findBySlug(slug: string) {
    return this.findBySlugOrThrow(slug, publicPostInclude);
  }

  /** 공개 조회: 공개된 글만 (draft는 404) */
  async findById(id: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, published: true },
      include: postWithRelationsInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /** 어드민 조회: draft 포함 */
  async findByIdForAdmin(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postWithRelationsInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(authorId: string, createPostDto: CreatePostDto) {
    const { tagIds, seriesId, ...data } = createPostDto;

    return persistWithUniqueSlug(data.title, this.slugExists(), (slug) => {
      const createData: Prisma.PostUncheckedCreateInput = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        published: data.published,
        slug,
        authorId,
        seriesId: seriesId || null,
        tags: tagIds?.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      };

      return this.prisma.post.create({
        data: createData,
        include: postWithRelationsInclude,
      });
    });
  }

  async update(id: number, authorId: string, updatePostDto: UpdatePostDto) {
    const post = await this.findByIdForAdmin(id);
    this.assertOwner(post, authorId, 'edit');

    const { tagIds, title, createdAt, seriesId, ...data } = updatePostDto;

    const persist = (slug: string) =>
      this.prisma.post.update({
        where: { id },
        data: {
          ...data,
          title,
          slug,
          createdAt: createdAt ? new Date(createdAt) : undefined,
          tags: tagIds ? { set: tagIds.map((tagId) => ({ id: tagId })) } : undefined,
          series:
            seriesId === null
              ? { disconnect: true }
              : seriesId
                ? { connect: { id: seriesId } }
                : undefined,
        } satisfies Prisma.PostUpdateInput,
        include: postWithRelationsInclude,
      });

    if (!title || title === post.title) {
      return persist(post.slug);
    }

    return persistWithUniqueSlug(title, this.slugExists(post.id), persist);
  }

  async delete(id: number, authorId: string) {
    const post = await this.findByIdForAdmin(id);
    this.assertOwner(post, authorId, 'delete');

    return this.prisma.post.delete({ where: { id } });
  }

  /** 조회수 증가 (공개 글만, 단일 원자적 update) */
  async incrementViewCount(slug: string) {
    let post: Post;
    try {
      post = await this.prisma.post.update({
        where: { slug, published: true },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      if (isPrismaError(err, 'P2025')) {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }

    this.statsService.recordView(slug, post.id).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to record view stat: ${message}`);
    });

    return post;
  }

  async getAdjacentPosts(id: number) {
    const currentPost = await this.prisma.post.findFirst({
      where: { id, published: true },
      select: { createdAt: true },
    });

    if (!currentPost) {
      throw new NotFoundException('Post not found');
    }

    const [prevPost, nextPost] = await Promise.all([
      this.prisma.post.findFirst({
        where: {
          published: true,
          createdAt: { lt: currentPost.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true },
      }),
      this.prisma.post.findFirst({
        where: {
          published: true,
          createdAt: { gt: currentPost.createdAt },
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, title: true, slug: true },
      }),
    ]);

    return { prevPost, nextPost };
  }

  /**
   * 좋아요 토글 (공개 글만)
   * 좋아요 행과 카운트를 하나의 트랜잭션에서 변경하고,
   * 동시 요청으로 unique 제약(P2002)이 위반되면 현재 상태를 반환
   */
  async toggleLike(slug: string, fingerprint: string) {
    if (!fingerprint) {
      throw new BadRequestException('Fingerprint is required');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const post = await this.findBySlugOrThrow(slug, undefined, tx);

        const { count } = await tx.postLike.deleteMany({
          where: { postId: post.id, fingerprint },
        });

        if (count > 0) {
          const updated = await tx.post.update({
            where: { id: post.id },
            data: { likeCount: { decrement: count } },
            select: { likeCount: true },
          });
          return { liked: false, likeCount: updated.likeCount };
        }

        await tx.postLike.create({ data: { postId: post.id, fingerprint } });
        const updated = await tx.post.update({
          where: { id: post.id },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
        return { liked: true, likeCount: updated.likeCount };
      });
    } catch (err) {
      if (isPrismaError(err, 'P2002')) {
        return this.getLikeStatus(slug, fingerprint);
      }
      throw err;
    }
  }

  async getLikeStatus(slug: string, fingerprint: string) {
    const post = await this.findBySlugOrThrow(slug);

    if (!fingerprint) {
      return { liked: false, likeCount: post.likeCount };
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: { postId_fingerprint: { postId: post.id, fingerprint } },
    });

    return { liked: !!existingLike, likeCount: post.likeCount };
  }

  /** 공개 글을 slug로 조회, 없거나 draft면 404 */
  private async findBySlugOrThrow<I extends Prisma.PostInclude = Record<string, never>>(
    slug: string,
    include?: I,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.PostGetPayload<{ include: I }>> {
    const post = await client.post.findFirst({
      where: { slug, published: true },
      include,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post as Prisma.PostGetPayload<{ include: I }>;
  }

  private assertOwner(post: { authorId: string }, authorId: string, action: 'edit' | 'delete') {
    if (post.authorId !== authorId) {
      throw new ForbiddenException(`You can only ${action} your own posts`);
    }
  }

  private slugExists(excludeId?: number) {
    return slugExistsCheck(
      (slug) => this.prisma.post.findUnique({ where: { slug }, select: { id: true } }),
      excludeId,
    );
  }
}
