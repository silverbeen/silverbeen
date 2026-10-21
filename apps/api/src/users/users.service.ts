import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import { isAdminRole } from '../common/utils/role.util';
import type { SupabaseUserDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  /** app_metadata.role → 로컬 Role */
  private resolveRole(role: unknown): Role {
    return isAdminRole(role) ? Role.ADMIN : Role.USER;
  }

  /**
   * Supabase 사용자 → 로컬 User upsert 인자
   * user_metadata.name이 없으면 기존 이름 유지 (undefined는 Prisma가 무시)
   */
  private toUpsertArgs(supabaseUser: SupabaseUserDto): Prisma.UserUpsertArgs {
    const role = this.resolveRole(supabaseUser.app_metadata?.role);
    const name = supabaseUser.user_metadata?.name;

    return {
      where: { id: supabaseUser.id },
      create: { id: supabaseUser.id, email: supabaseUser.email, name, role },
      update: { email: supabaseUser.email, name, role },
    };
  }

  /**
   * Supabase Auth 사용자를 로컬 User 테이블에 동기화 (upsert, 단일 트랜잭션)
   */
  async syncSupabaseUsers(supabaseUsers: SupabaseUserDto[]): Promise<{
    synced: number;
    created: number;
    updated: number;
  }> {
    const ids = supabaseUsers.map((user) => user.id);

    const updated = await this.prisma.user.count({ where: { id: { in: ids } } });

    await this.prisma.$transaction(
      supabaseUsers.map((user) => this.prisma.user.upsert(this.toUpsertArgs(user))),
    );

    const created = supabaseUsers.length - updated;
    this.logger.log(`Synced ${supabaseUsers.length} users: ${created} created, ${updated} updated`);

    return {
      synced: supabaseUsers.length,
      created,
      updated,
    };
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
   * Supabase Auth에서 모든 사용자 조회
   */
  async findAllFromSupabase() {
    const users = await this.supabaseAdmin.listAllUsers();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: (user.user_metadata?.name as string | undefined) || null,
      role: this.resolveRole(user.app_metadata?.role),
      emailConfirmedAt: user.email_confirmed_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
      createdAt: user.created_at,
    }));
  }

  /**
   * Supabase Auth에서 사용자 삭제
   */
  async deleteFromSupabase(id: string, currentUserId: string) {
    this.supabaseAdmin.assertConfigured();

    // 자기 자신 삭제 방지
    if (id === currentUserId) {
      throw new ForbiddenException('자기 자신은 삭제할 수 없습니다');
    }

    // 마지막 관리자 삭제 방지
    if (await this.checkLastAdmin(id)) {
      throw new ForbiddenException('마지막 관리자는 삭제할 수 없습니다');
    }

    await this.supabaseAdmin.deleteUser(id);

    // 로컬 DB에서도 삭제 (존재하는 경우)
    await this.prisma.user.deleteMany({ where: { id } });

    this.logger.log(`User ${id} deleted successfully`);
    return { success: true };
  }

  /**
   * Supabase Auth에서 사용자 역할 변경
   */
  async updateRoleFromSupabase(id: string, role: Role, currentUserId: string) {
    this.supabaseAdmin.assertConfigured();

    // 자기 자신 권한 변경 방지
    if (id === currentUserId) {
      throw new ForbiddenException('자기 자신의 권한은 변경할 수 없습니다');
    }

    // 마지막 관리자 권한 해제 방지
    if (role === Role.USER && (await this.checkLastAdmin(id))) {
      throw new ForbiddenException('마지막 관리자의 권한을 해제할 수 없습니다');
    }

    const user = await this.supabaseAdmin.updateAppMetadata(id, { role: role.toLowerCase() });

    // 로컬 DB에서도 업데이트 (존재하는 경우)
    await this.prisma.user.updateMany({
      where: { id },
      data: { role },
    });

    this.logger.log(`User ${id} role updated to ${role}`);
    return {
      id: user.id,
      email: user.email,
      name: (user.user_metadata?.name as string | undefined) || null,
      role,
    };
  }

  /**
   * 마지막 관리자인지 확인
   * 에러 발생 시 fail-closed: 관리자 삭제/권한 해제를 차단
   */
  private async checkLastAdmin(id: string): Promise<boolean> {
    if (!this.supabaseAdmin.isConfigured) {
      this.logger.warn('Supabase Admin client not configured, blocking admin action for safety');
      return true; // fail-closed: 확인할 수 없으면 차단
    }

    try {
      const users = await this.supabaseAdmin.listAllUsers();
      const adminIds = users
        .filter((user) => this.resolveRole(user.app_metadata?.role) === Role.ADMIN)
        .map((user) => user.id);

      return adminIds.length <= 1 && adminIds.includes(id);
    } catch (err) {
      this.logger.error('Failed to list users for last admin check', err);
      return true; // fail-closed: 예외 시 차단
    }
  }
}
