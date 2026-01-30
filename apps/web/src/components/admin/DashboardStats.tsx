'use client';

import { useEffect, useState } from 'react';
import { FileText, Tag, Eye, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Post, Tag as TagType } from '@/types/post';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
  totalViews: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          return;
        }

        const [posts, tagsData] = await Promise.all([
          api.blogs.getAdminList(session.access_token),
          api.tags.getList(),
        ]);

        const tags = tagsData as TagType[];

        setStats({
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: Post) => p.published).length,
          draftPosts: posts.filter((p: Post) => !p.published).length,
          totalTags: tags.length,
          totalViews: posts.reduce((sum: number, p: Post) => sum + p.viewCount, 0),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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

  if (!stats) return null;

  const statItems = [
    {
      label: '전체 게시글',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: '발행됨',
      value: stats.publishedPosts,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: '임시저장',
      value: stats.draftPosts,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: '태그',
      value: stats.totalTags,
      icon: Tag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: '총 조회수',
      value: stats.totalViews.toLocaleString(),
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
