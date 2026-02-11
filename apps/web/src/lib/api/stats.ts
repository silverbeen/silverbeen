import { fetcher } from './client';

export interface DailyStat {
  date: string;
  views: number;
}

export interface TopPost {
  id: number;
  title: string;
  slug: string;
  viewCount: number;
  createdAt: string;
}

export interface TagStat {
  name: string;
  postCount: number;
  totalViews: number;
}

export interface StatsOverview {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  todayViews: number;
}

export const statsApi = {
  getOverview: (token: string) =>
    fetcher<StatsOverview>('/stats/overview', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getDailyStats: (token: string, days?: number) =>
    fetcher<DailyStat[]>(`/stats/daily${days ? `?days=${days}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getTopPosts: (token: string, limit?: number) =>
    fetcher<TopPost[]>(`/stats/top-posts${limit ? `?limit=${limit}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getTagStats: (token: string) =>
    fetcher<TagStat[]>('/stats/tags', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
