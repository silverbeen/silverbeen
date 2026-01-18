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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.postsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      tag,
      sortBy: sortBy as 'createdAt' | 'viewCount' | 'title',
      order: order as 'asc' | 'desc',
    });
  }

  @Get('admin')
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAllAdmin(@CurrentUser() user: AuthUser) {
    return this.postsService.findAllAdmin(user.id);
  }

  @Get(':idOrSlug')
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    // 숫자인 경우 ID로 조회, 아닌 경우 slug로 조회
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
      return this.postsService.findById(id);
    }
    return this.postsService.findBySlug(idOrSlug);
  }

  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createPostDto: CreatePostDto,
  ) {
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

  @Get(':id/adjacent')
  async getAdjacentPosts(@Param('id') id: string) {
    return this.postsService.getAdjacentPosts(parseInt(id, 10));
  }
}
