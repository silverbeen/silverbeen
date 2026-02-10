import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

interface SupabaseUser {
  id: string;
  email: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    name?: string;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly supabaseAdmin: SupabaseClient | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && serviceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      this.logger.warn(
        'Supabase Admin client not configured - SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing',
      );
    }
  }

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
            role: supabaseUser.app_metadata?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
          },
        });
        updated++;
      } else {
        await this.prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name,
            role: supabaseUser.app_metadata?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
          },
        });
        created++;
      }
    }

    this.logger.log(`Synced ${supabaseUsers.length} users: ${created} created, ${updated} updated`);

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
        role: supabaseUser.app_metadata?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      update: {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name,
        role: supabaseUser.app_metadata?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
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

    const invalidAuthorIds = Array.from(postAuthorIds).filter((id) => !existingUserIds.has(id));

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
   * 모든 사용자 조회 (로컬 DB)
   */
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Supabase Auth에서 모든 사용자 조회 (페이지네이션 처리)
   */
  async findAllFromSupabase() {
    if (!this.supabaseAdmin) {
      this.logger.error('Supabase Admin client not configured');
      throw new InternalServerErrorException(
        'Supabase Admin client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      );
    }

    try {
      const allUsers: Array<{
        id: string;
        email: string | undefined;
        name: string | null;
        role: string;
        emailConfirmedAt: string | null;
        lastSignInAt: string | null;
        createdAt: string;
      }> = [];

      const perPage = 100;
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await this.supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (error) {
          this.logger.error(`Failed to fetch users from Supabase (page ${page})`, error);
          throw new InternalServerErrorException(`Supabase error: ${error.message}`);
        }

        const mappedUsers = data.users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
          role: user.app_metadata?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
          emailConfirmedAt: user.email_confirmed_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
          createdAt: user.created_at,
        }));

        allUsers.push(...mappedUsers);

        if (data.users.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return allUsers;
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('Unexpected error fetching users from Supabase', err);
      throw new InternalServerErrorException('Failed to fetch users from Supabase');
    }
  }

  /**
   * Supabase Auth에서 사용자 삭제
   */
  async deleteFromSupabase(id: string, currentUserId: string) {
    if (!this.supabaseAdmin) {
      throw new InternalServerErrorException('Supabase Admin client not configured');
    }

    // 자기 자신 삭제 방지
    if (id === currentUserId) {
      throw new ForbiddenException('자기 자신은 삭제할 수 없습니다');
    }

    // 마지막 관리자 삭제 방지
    if (await this.checkLastAdmin(id)) {
      throw new ForbiddenException('마지막 관리자는 삭제할 수 없습니다');
    }

    try {
      const { error } = await this.supabaseAdmin.auth.admin.deleteUser(id);

      if (error) {
        this.logger.error(`Failed to delete user ${id} from Supabase`, error);
        throw new InternalServerErrorException(`Supabase error: ${error.message}`);
      }

      // 로컬 DB에서도 삭제 (존재하는 경우)
      await this.prisma.user.deleteMany({ where: { id } });

      this.logger.log(`User ${id} deleted successfully`);
      return { success: true };
    } catch (err) {
      if (err instanceof InternalServerErrorException || err instanceof ForbiddenException)
        throw err;
      this.logger.error(`Unexpected error deleting user ${id}`, err);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  /**
   * Supabase Auth에서 사용자 역할 변경
   */
  async updateRoleFromSupabase(id: string, role: Role, currentUserId: string) {
    if (!this.supabaseAdmin) {
      throw new InternalServerErrorException('Supabase Admin client not configured');
    }

    // 자기 자신 권한 변경 방지
    if (id === currentUserId) {
      throw new ForbiddenException('자기 자신의 권한은 변경할 수 없습니다');
    }

    // 마지막 관리자 권한 해제 방지
    if (role === Role.USER && (await this.checkLastAdmin(id))) {
      throw new ForbiddenException('마지막 관리자의 권한을 해제할 수 없습니다');
    }

    try {
      const { data, error } = await this.supabaseAdmin.auth.admin.updateUserById(id, {
        app_metadata: { role: role.toLowerCase() },
      });

      if (error) {
        this.logger.error(`Failed to update role for user ${id}`, error);
        throw new InternalServerErrorException(`Supabase error: ${error.message}`);
      }

      // 로컬 DB에서도 업데이트 (존재하는 경우)
      await this.prisma.user.updateMany({
        where: { id },
        data: { role },
      });

      this.logger.log(`User ${id} role updated to ${role}`);
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null,
        role,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException || err instanceof ForbiddenException)
        throw err;
      this.logger.error(`Unexpected error updating role for user ${id}`, err);
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  /**
   * 마지막 관리자인지 확인 (단일 API 호출로 최적화)
   * 에러 발생 시 fail-closed: 관리자 삭제/권한 해제를 차단
   */
  private async checkLastAdmin(id: string): Promise<boolean> {
    if (!this.supabaseAdmin) {
      this.logger.warn('Supabase Admin client not configured, blocking admin action for safety');
      return true; // fail-closed: 확인할 수 없으면 차단
    }

    try {
      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers();
      if (error) {
        this.logger.error('Failed to list users for last admin check', error);
        return true; // fail-closed: 에러 시 차단
      }

      const admins = data.users.filter(
        (user) => user.app_metadata?.role?.toUpperCase() === 'ADMIN',
      );
      return admins.length <= 1 && admins.some((admin) => admin.id === id);
    } catch (err) {
      this.logger.error('Unexpected error in checkLastAdmin', err);
      return true; // fail-closed: 예외 시 차단
    }
  }
}
