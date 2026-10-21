import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
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
      search: query.search,
    });
  }

  @Get('admin')
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAllAdmin(@CurrentUser() user: AuthUser) {
    return this.postsService.findAllAdmin(user.id);
  }

  // 어드민 전용: draft 포함 ID 조회 (':idOrSlug'보다 먼저 선언)
  @Get('admin/:id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async findByIdForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findByIdForAdmin(id);
  }

  // 공개 조회: 공개된 글만 반환 (draft는 404)
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
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.postsService.delete(id, user.id);
  }

  @Post(':slug/view')
  async incrementView(@Param('slug') slug: string) {
    return this.postsService.incrementViewCount(slug);
  }

  @Post(':slug/like')
  async toggleLike(@Param('slug') slug: string, @Body('fingerprint') fingerprint: string) {
    return this.postsService.toggleLike(slug, fingerprint);
  }

  @Get(':slug/like-status')
  async getLikeStatus(@Param('slug') slug: string, @Query('fingerprint') fingerprint: string) {
    return this.postsService.getLikeStatus(slug, fingerprint);
  }

  @Get(':id/adjacent')
  async getAdjacentPosts(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getAdjacentPosts(id);
  }
}
