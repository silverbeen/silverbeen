import type { DailyStat, TopPost, TagStat, StatsOverview } from '@silverbeen/types';
import { fetcher } from './client';

export const statsApi = {
  getOverview: () =>
    fetcher<StatsOverview>('/stats/overview', {
      auth: true,
    }),

  getDailyStats: (days?: number) =>
    fetcher<DailyStat[]>(`/stats/daily${days ? `?days=${days}` : ''}`, {
      auth: true,
    }),

  getTopPosts: (limit?: number) =>
    fetcher<TopPost[]>(`/stats/top-posts${limit ? `?limit=${limit}` : ''}`, {
      auth: true,
    }),

  getTagStats: () =>
    fetcher<TagStat[]>('/stats/tags', {
      auth: true,
    }),
};
