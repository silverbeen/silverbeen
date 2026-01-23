import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Supabase Auth 사용자를 로컬 User 테이블에 동기화 (upsert)
   * 마이그레이션 전 또는 사용자 로그인 시 호출
   */
  async syncSupabaseUsers(supabaseUsers: SupabaseUser[]): Promise<{
    synced: number;
    created: number;
    updated: number;
  }> {
    let created = 0;
    let updated = 0;

    for (const supabaseUser of supabaseUsers) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: supabaseUser.id },
      });

      if (existingUser) {
        await this.prisma.user.update({
          where: { id: supabaseUser.id },
          data: {
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name ?? existingUser.name,
            role:
              supabaseUser.user_metadata?.role?.toUpperCase() === 'ADMIN'
                ? 'ADMIN'
                : 'USER',
          },
        });
        updated++;
      } else {
        await this.prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name,
            role:
              supabaseUser.user_metadata?.role?.toUpperCase() === 'ADMIN'
                ? 'ADMIN'
                : 'USER',
          },
        });
        created++;
      }
    }

    this.logger.log(
      `Synced ${supabaseUsers.length} users: ${created} created, ${updated} updated`,
    );

    return {
      synced: supabaseUsers.length,
      created,
      updated,
    };
  }

  /**
   * 단일 사용자 동기화 (로그인 시 사용)
   */
  async syncUser(supabaseUser: SupabaseUser) {
    return this.prisma.user.upsert({
      where: { id: supabaseUser.id },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name,
        role:
          supabaseUser.user_metadata?.role?.toUpperCase() === 'ADMIN'
            ? 'ADMIN'
            : 'USER',
      },
      update: {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name,
        role:
          supabaseUser.user_metadata?.role?.toUpperCase() === 'ADMIN'
            ? 'ADMIN'
            : 'USER',
      },
    });
  }

  /**
   * Post의 authorId가 유효한 User를 참조하는지 검증
   */
  async validatePostAuthors(): Promise<{
    total: number;
    valid: number;
    invalid: string[];
  }> {
    const posts = await this.prisma.post.findMany({
      select: { id: true, authorId: true },
    });

    const postAuthorIds = new Set(posts.map((post) => post.authorId));

    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: Array.from(postAuthorIds) } },
      select: { id: true },
    });

    const existingUserIds = new Set(existingUsers.map((user) => user.id));

    const invalidAuthorIds = Array.from(postAuthorIds).filter(
      (id) => !existingUserIds.has(id),
    );

    return {
      total: posts.length,
      valid: posts.length - invalidAuthorIds.length,
      invalid: invalidAuthorIds,
    };
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 모든 사용자 조회
   */
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
