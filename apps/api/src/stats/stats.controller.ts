import { Controller, Get, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

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
  async getDailyStats(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.statsService.getDailyStats(days);
  }

  @Get('top-posts')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTopPosts(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.statsService.getTopPosts(limit);
  }

  @Get('tags')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTagStats() {
    return this.statsService.getTagStats();
  }
}
