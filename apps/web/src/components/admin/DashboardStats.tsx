'use client';

import { FileText, Tag, Eye, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminResource } from '@/hooks/useAdminResource';
import type { StatsOverview } from '@silverbeen/types';

interface DashboardStatsData {
  overview: StatsOverview;
  totalTags: number;
}

async function loadDashboardStats(): Promise<DashboardStatsData | null> {
  const [overview, tags] = await Promise.all([api.stats.getOverview(), api.tags.getList()]);
  return { overview, totalTags: tags.length };
}

export function DashboardStats() {
  const { data: stats, loading, error, reload } = useAdminResource(loadDashboardStats, null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div role="alert" className="mb-8 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <span>통계를 불러오지 못했습니다{error ? `: ${error.message}` : '.'}</span>
        <button type="button" onClick={reload} className="font-medium underline">
          다시 시도
        </button>
      </div>
    );
  }

  const { overview, totalTags } = stats;

  const statItems = [
    {
      label: '전체 게시글',
      value: overview.totalPosts,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: '발행됨',
      value: overview.publishedPosts,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: '임시저장',
      value: overview.draftPosts,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: '태그',
      value: totalTags,
      icon: Tag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: '총 조회수',
      value: overview.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {item.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
