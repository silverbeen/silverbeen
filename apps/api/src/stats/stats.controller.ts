import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetDailyStatsQuery, GetTopPostsQuery } from './dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getOverview() {
    return this.statsService.getOverview();
  }

  @Get('daily')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getDailyStats(@Query() query: GetDailyStatsQuery) {
    return this.statsService.getDailyStats(query.days);
  }

  @Get('top-posts')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTopPosts(@Query() query: GetTopPostsQuery) {
    return this.statsService.getTopPosts(query.limit);
  }

  @Get('tags')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTagStats() {
    return this.statsService.getTagStats();
  }
}
