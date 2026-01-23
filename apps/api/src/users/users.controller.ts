import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SyncUsersDto } from './dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users/sync
   * Supabase Auth 사용자를 로컬 DB에 동기화 (Admin 전용)
   */
  @Post('sync')
  @UseGuards(SupabaseGuard, AdminGuard)
  async syncUsers(@Body() syncUsersDto: SyncUsersDto) {
    this.logger.log(`Syncing ${syncUsersDto.users.length} users from Supabase`);
    return this.usersService.syncSupabaseUsers(syncUsersDto.users);
  }

  /**
   * GET /users/validate-authors
   * Post의 authorId 유효성 검사 (Admin 전용)
   */
  @Get('validate-authors')
  @UseGuards(SupabaseGuard, AdminGuard)
  async validateAuthors() {
    return this.usersService.validatePostAuthors();
  }

  /**
   * GET /users
   * 모든 사용자 목록 조회 (Admin 전용)
   */
  @Get()
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }
}
