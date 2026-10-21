import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User, UserAppMetadata } from '@supabase/supabase-js';

const LIST_USERS_PER_PAGE = 100;

/**
 * Supabase Admin API (service role) 래퍼
 * - 클라이언트 미설정 시 InternalServerErrorException
 * - Supabase 에러/예외는 InternalServerErrorException으로 변환
 */
@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private readonly client: SupabaseClient | null = null;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && serviceRoleKey) {
      this.client = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      this.logger.warn(
        'Supabase Admin client not configured - SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing',
      );
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /** 클라이언트 설정 여부 확인 (미설정 시 500) */
  assertConfigured(): void {
    this.getClient();
  }

  /** Supabase Auth의 모든 사용자 조회 (페이지네이션 처리) */
  async listAllUsers(): Promise<User[]> {
    const client = this.getClient();

    return this.run('fetch users from Supabase', async () => {
      const allUsers: User[] = [];
      let page = 1;

      for (;;) {
        const { data, error } = await client.auth.admin.listUsers({
          page,
          perPage: LIST_USERS_PER_PAGE,
        });

        if (error) {
          this.logger.error(`Failed to fetch users from Supabase (page ${page})`, error);
          throw new InternalServerErrorException(`Supabase error: ${error.message}`);
        }

        allUsers.push(...data.users);

        if (data.users.length < LIST_USERS_PER_PAGE) {
          return allUsers;
        }
        page++;
      }
    });
  }

  /** Supabase Auth 사용자 삭제 */
  async deleteUser(id: string): Promise<void> {
    const client = this.getClient();

    await this.run(`delete user ${id}`, async () => {
      const { error } = await client.auth.admin.deleteUser(id);
      if (error) {
        this.logger.error(`Failed to delete user ${id} from Supabase`, error);
        throw new InternalServerErrorException(`Supabase error: ${error.message}`);
      }
    });
  }

  /** Supabase Auth 사용자 app_metadata 변경 */
  async updateAppMetadata(id: string, appMetadata: UserAppMetadata): Promise<User> {
    const client = this.getClient();

    return this.run(`update user ${id}`, async () => {
      const { data, error } = await client.auth.admin.updateUserById(id, {
        app_metadata: appMetadata,
      });
      if (error) {
        this.logger.error(`Failed to update user ${id}`, error);
        throw new InternalServerErrorException(`Supabase error: ${error.message}`);
      }
      return data.user;
    });
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      this.logger.error('Supabase Admin client not configured');
      throw new InternalServerErrorException(
        'Supabase Admin client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      );
    }
    return this.client;
  }

  /** HttpException은 그대로, 그 외 예외는 500으로 변환 */
  private async run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error(`Unexpected error: ${operation}`, err);
      throw new InternalServerErrorException(`Failed to ${operation}`);
    }
  }
}
