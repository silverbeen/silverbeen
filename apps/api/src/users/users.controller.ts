import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { SyncUsersDto, UpdateUserRoleDto } from './dto';

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
   * Supabase Auth에서 모든 사용자 목록 조회 (Admin 전용)
   */
  @Get()
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAll() {
    return this.usersService.findAllFromSupabase();
  }

  /**
   * PATCH /users/:id/role
   * 사용자 역할 변경 (Admin 전용)
   */
  @Patch(':id/role')
  @UseGuards(SupabaseGuard, AdminGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    this.logger.log(`Updating role for user ${id} to ${updateUserRoleDto.role}`);
    return this.usersService.updateRoleFromSupabase(id, updateUserRoleDto.role, currentUser.id);
  }

  /**
   * DELETE /users/:id
   * 사용자 삭제 (Admin 전용)
   */
  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
    this.logger.log(`Deleting user ${id}`);
    return this.usersService.deleteFromSupabase(id, currentUser.id);
  }
}
