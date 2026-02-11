import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, GetPostsQueryDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query() query: GetPostsQueryDto) {
    return this.postsService.findAll({
      page: query.page,
      limit: query.limit,
      tag: query.tag,
      sortBy: query.sortBy,
      order: query.order,
    });
  }

  @Get('admin')
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAllAdmin(@CurrentUser() user: AuthUser) {
    return this.postsService.findAllAdmin(user.id);
  }

  @Get(':idOrSlug')
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    // 전체 문자열이 숫자인 경우에만 ID로 조회, 아닌 경우 slug로 조회
    if (/^\d+$/.test(idOrSlug)) {
      return this.postsService.findById(parseInt(idOrSlug, 10));
    }
    return this.postsService.findBySlug(idOrSlug);
  }

  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(@CurrentUser() user: AuthUser, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(parseInt(id, 10), user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.delete(parseInt(id, 10), user.id);
  }

  @Post(':slug/view')
  async incrementView(@Param('slug') slug: string) {
    return this.postsService.incrementViewCount(slug);
  }

  @Post(':slug/like')
  async toggleLike(
    @Param('slug') slug: string,
    @Body('fingerprint') fingerprint: string,
  ) {
    return this.postsService.toggleLike(slug, fingerprint);
  }

  @Get(':slug/like-status')
  async getLikeStatus(
    @Param('slug') slug: string,
    @Query('fingerprint') fingerprint: string,
  ) {
    return this.postsService.getLikeStatus(slug, fingerprint);
  }

  @Get(':id/adjacent')
  async getAdjacentPosts(@Param('id') id: string) {
    return this.postsService.getAdjacentPosts(parseInt(id, 10));
  }
}
