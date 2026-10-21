import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { SupabaseAdminService } from '../supabase/supabase-admin.service';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';

describe('UsersService', () => {
  let prisma: {
    user: { count: jest.Mock; upsert: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        count: jest.fn(),
        upsert: jest.fn((args: unknown) => args),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.resolve(ops)),
    };
    service = new UsersService(
      prisma as unknown as PrismaService,
      {} as unknown as SupabaseAdminService,
    );
  });

  it('preserves admin role from app_metadata and upserts in one transaction', async () => {
    prisma.user.count.mockResolvedValue(1);

    const result = await service.syncSupabaseUsers([
      { id: ADMIN_ID, email: 'admin@example.com', app_metadata: { role: 'admin' } },
      { id: USER_ID, email: 'user@example.com', user_metadata: { name: 'User' } },
    ]);

    expect(result).toEqual({ synced: 2, created: 1, updated: 1 });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: ADMIN_ID },
      create: { id: ADMIN_ID, email: 'admin@example.com', name: undefined, role: Role.ADMIN },
      update: { email: 'admin@example.com', name: undefined, role: Role.ADMIN },
    });
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: USER_ID },
      create: { id: USER_ID, email: 'user@example.com', name: 'User', role: Role.USER },
      update: { email: 'user@example.com', name: 'User', role: Role.USER },
    });
  });

  it('treats role case-insensitively', async () => {
    prisma.user.count.mockResolvedValue(0);

    await service.syncSupabaseUsers([
      { id: ADMIN_ID, email: 'admin@example.com', app_metadata: { role: 'ADMIN' } },
    ]);

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ role: Role.ADMIN }) as unknown }),
    );
  });
});
