import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PostsService } from './posts.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { StatsService } from '../stats/stats.service';

const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError('unique', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: ['post_id', 'fingerprint'] },
  });

function createPrismaMock() {
  const prisma = {
    post: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    postLike: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  // 인터랙티브 트랜잭션: 같은 mock을 tx로 전달
  prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
  return prisma;
}

describe('PostsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: PostsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    const stats = { recordView: jest.fn().mockResolvedValue(undefined) };
    service = new PostsService(
      prisma as unknown as PrismaService,
      stats as unknown as StatsService,
    );
  });

  describe('public lookup', () => {
    it('findBySlug only queries published posts and 404s for drafts', async () => {
      prisma.post.findFirst.mockResolvedValue(null);

      await expect(service.findBySlug('draft-post')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.post.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'draft-post', published: true } }),
      );
    });

    it('findById only queries published posts and 404s for drafts', async () => {
      prisma.post.findFirst.mockResolvedValue(null);

      await expect(service.findById(3)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.post.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 3, published: true } }),
      );
    });

    it('findByIdForAdmin returns drafts', async () => {
      const draft = { id: 3, published: false };
      prisma.post.findUnique.mockResolvedValue(draft);

      await expect(service.findByIdForAdmin(3)).resolves.toBe(draft);
      expect(prisma.post.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 3 } }),
      );
    });

    it('getLikeStatus 404s when slug is missing or a draft (findBySlugOrThrow)', async () => {
      prisma.post.findFirst.mockResolvedValue(null);

      await expect(service.getLikeStatus('nope', 'fp')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('incrementViewCount 404s for drafts (P2025 from conditional update)', async () => {
      prisma.post.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('not found', {
          code: 'P2025',
          clientVersion: 'test',
        }),
      );

      await expect(service.incrementViewCount('draft')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'draft', published: true } }),
      );
    });
  });

  describe('toggleLike', () => {
    beforeEach(() => {
      prisma.post.findFirst.mockResolvedValue({ id: 1, likeCount: 5 });
    });

    it('likes when no existing like', async () => {
      prisma.postLike.deleteMany.mockResolvedValue({ count: 0 });
      prisma.post.update.mockResolvedValue({ likeCount: 6 });

      await expect(service.toggleLike('slug', 'fp')).resolves.toEqual({
        liked: true,
        likeCount: 6,
      });
      expect(prisma.postLike.create).toHaveBeenCalledWith({
        data: { postId: 1, fingerprint: 'fp' },
      });
    });

    it('unlikes when a like existed', async () => {
      prisma.postLike.deleteMany.mockResolvedValue({ count: 1 });
      prisma.post.update.mockResolvedValue({ likeCount: 4 });

      await expect(service.toggleLike('slug', 'fp')).resolves.toEqual({
        liked: false,
        likeCount: 4,
      });
      expect(prisma.postLike.create).not.toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { likeCount: { decrement: 1 } } }),
      );
    });

    it('returns current status when a concurrent like hits the unique constraint', async () => {
      prisma.postLike.deleteMany.mockResolvedValue({ count: 0 });
      prisma.postLike.create.mockRejectedValue(p2002());
      prisma.postLike.findUnique.mockResolvedValue({ id: 'like-1' });

      await expect(service.toggleLike('slug', 'fp')).resolves.toEqual({
        liked: true,
        likeCount: 5,
      });
    });

    it('404s for drafts', async () => {
      prisma.post.findFirst.mockResolvedValue(null);

      await expect(service.toggleLike('draft', 'fp')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.postLike.deleteMany).not.toHaveBeenCalled();
    });
  });
});
