import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  async getDailyStats(@Query('days') days?: string) {
    return this.statsService.getDailyStats(days ? parseInt(days, 10) : 30);
  }

  @Get('top-posts')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTopPosts(@Query('limit') limit?: string) {
    return this.statsService.getTopPosts(limit ? parseInt(limit, 10) : 10);
  }

  @Get('tags')
  @UseGuards(SupabaseGuard, AdminGuard)
  async getTagStats() {
    return this.statsService.getTagStats();
  }
}
