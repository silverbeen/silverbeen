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
