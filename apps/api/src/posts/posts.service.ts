import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class PostsService implements OnModuleInit {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.fixEmptySlugs();
  }

  private async fixEmptySlugs() {
    const postsWithEmptySlugs = await this.prisma.post.findMany({
      where: { slug: '' },
    });

    if (postsWithEmptySlugs.length === 0) {
      return;
    }

    this.logger.log(`Found ${postsWithEmptySlugs.length} posts with empty slugs. Fixing...`);

    for (const post of postsWithEmptySlugs) {
      const newSlug = await generateUniqueSlug(post.title, async (slug) => {
        const existing = await this.prisma.post.findUnique({
          where: { slug },
        });
        return !!existing && existing.id !== post.id;
      });

      await this.prisma.post.update({
        where: { id: post.id },
        data: { slug: newSlug },
      });

      this.logger.log(`Fixed slug for post "${post.title}": ${newSlug}`);
    }
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    tag?: string;
    sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'title';
    order?: 'asc' | 'desc';
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const order = options?.order || 'desc';

    const where: Record<string, unknown> = { published: true };

    if (options?.tag) {
      where.tags = {
        some: { name: options.tag },
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: { tags: true },
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
      include: { tags: true },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: { tags: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findById(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(authorId: string, createPostDto: CreatePostDto) {
    const { tagIds, ...data } = createPostDto;

    const slug = await generateUniqueSlug(data.title, async (slug) => {
      const existing = await this.prisma.post.findUnique({ where: { slug } });
      return !!existing;
    });

    return this.prisma.post.create({
      data: {
        ...data,
        slug,
        authorId,
        tags: tagIds?.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { tags: true },
    });
  }

  async update(id: number, authorId: string, updatePostDto: UpdatePostDto) {
    const post = await this.findById(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { tagIds, title, createdAt, ...data } = updatePostDto;

    let slug = post.slug;
    if (title && title !== post.title) {
      slug = await generateUniqueSlug(title, async (newSlug) => {
        if (newSlug === post.slug) return false;
        const existing = await this.prisma.post.findUnique({
          where: { slug: newSlug },
        });
        return !!existing;
      });
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        title,
        slug,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        tags: tagIds ? { set: [], connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { tags: true },
    });
  }

  async delete(id: number, authorId: string) {
    const post = await this.findById(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({ where: { id } });
  }

  async incrementViewCount(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  }

  async getAdjacentPosts(id: number) {
    const currentPost = await this.prisma.post.findUnique({
      where: { id },
      select: { createdAt: true, published: true },
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

  async toggleLike(slug: string, fingerprint: string) {
    if (!fingerprint) {
      throw new BadRequestException('Fingerprint is required');
    }

    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: { postId_fingerprint: { postId: post.id, fingerprint } },
    });

    if (existingLike) {
      const [, updatedPost] = await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { id: existingLike.id } }),
        this.prisma.post.update({
          where: { id: post.id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false, likeCount: updatedPost.likeCount };
    } else {
      const [, updatedPost] = await this.prisma.$transaction([
        this.prisma.postLike.create({
          data: { postId: post.id, fingerprint },
        }),
        this.prisma.post.update({
          where: { id: post.id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return { liked: true, likeCount: updatedPost.likeCount };
    }
  }

  async getLikeStatus(slug: string, fingerprint: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!fingerprint) {
      return { liked: false, likeCount: post.likeCount };
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: { postId_fingerprint: { postId: post.id, fingerprint } },
    });

    return { liked: !!existingLike, likeCount: post.likeCount };
  }
}
