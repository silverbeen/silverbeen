import { NotFoundException } from '@nestjs/common';
import { SeriesService } from './series.service';
import type { PrismaService } from '../prisma/prisma.service';

const SERIES_ID = '6f1c1f1e-1b1a-4c3d-8e9f-0a1b2c3d4e5f';

function createPrismaMock() {
  const prisma = {
    series: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    post: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
  return prisma;
}

describe('SeriesService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: SeriesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SeriesService(prisma as unknown as PrismaService);
  });

  describe('updatePostOrder', () => {
    it('detaches all posts when postIds is empty', async () => {
      prisma.series.findUnique.mockResolvedValue({ id: SERIES_ID });
      prisma.series.findUniqueOrThrow.mockResolvedValue({ id: SERIES_ID, posts: [] });

      const result = await service.updatePostOrder(SERIES_ID, []);

      expect(prisma.post.updateMany).toHaveBeenCalledWith({
        where: { seriesId: SERIES_ID, NOT: { id: { in: [] } } },
        data: { seriesId: null, seriesOrder: null },
      });
      expect(prisma.post.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: SERIES_ID, posts: [] });
    });

    it('orders given posts and detaches the rest', async () => {
      prisma.series.findUnique.mockResolvedValue({ id: SERIES_ID });
      prisma.series.findUniqueOrThrow.mockResolvedValue({ id: SERIES_ID, posts: [] });

      await service.updatePostOrder(SERIES_ID, [7, 3]);

      expect(prisma.post.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { seriesId: SERIES_ID, NOT: { id: { in: [7, 3] } } } }),
      );
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { seriesId: SERIES_ID, seriesOrder: 1 },
      });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { seriesId: SERIES_ID, seriesOrder: 2 },
      });
    });

    it('404s when the series does not exist', async () => {
      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.updatePostOrder(SERIES_ID, [])).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.post.updateMany).not.toHaveBeenCalled();
    });
  });

  it('findById only includes published posts', async () => {
    prisma.series.findUnique.mockResolvedValue({ id: SERIES_ID, posts: [] });

    await service.findById(SERIES_ID);

    expect(prisma.series.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          posts: expect.objectContaining({ where: { published: true } }) as unknown,
        },
      }),
    );
  });
});
