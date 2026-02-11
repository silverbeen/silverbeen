'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, FileText, TrendingUp, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { DailyStat, TopPost, TagStat, StatsOverview } from '@/lib/api/stats';

export default function AdminStatsPage() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const token = session.access_token;

      const [ov, daily, top, tags] = await Promise.all([
        api.stats.getOverview(token),
        api.stats.getDailyStats(token, days),
        api.stats.getTopPosts(token),
        api.stats.getTagStats(token),
      ]);

      setOverview(ov);
      setDailyStats(daily);
      setTopPosts(top);
      setTagStats(tags);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxViews = Math.max(...dailyStats.map((d) => d.views), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">방문자 통계</h1>
        </div>

        {overview && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: '총 조회수', value: overview.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: '오늘 조회수', value: overview.todayViews.toLocaleString(), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
              { label: '발행 글', value: overview.publishedPosts, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
              { label: '임시저장', value: overview.draftPosts, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${item.bg}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">일별 조회수</h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    days === d
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d}일
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-48 items-end gap-1">
            {dailyStats.map((stat) => (
              <div key={stat.date} className="group relative flex flex-1 flex-col items-center">
                <div className="absolute -top-8 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-600">
                  {stat.views}
                </div>
                <div
                  className="w-full rounded-t bg-primary-400 transition-all hover:bg-primary-500 dark:bg-primary-600"
                  style={{ height: `${Math.max((stat.views / maxViews) * 100, 2)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{dailyStats[0]?.date?.slice(5)}</span>
            <span>{dailyStats[dailyStats.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">인기 글 TOP 10</h2>
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {index + 1}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex-1 truncate text-sm text-gray-700 hover:text-primary-500 dark:text-gray-300"
                  >
                    {post.title}
                  </Link>
                  <span className="shrink-0 text-sm text-gray-400">
                    {post.viewCount.toLocaleString()}
                  </span>
                </div>
              ))}
              {topPosts.length === 0 && (
                <p className="text-sm text-gray-400">데이터가 없습니다.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">태그별 통계</h2>
            <div className="space-y-3">
              {tagStats.map((tag) => {
                const maxTagViews = Math.max(...tagStats.map((t) => t.totalViews), 1);
                return (
                  <div key={tag.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                      <span className="text-xs text-gray-400">
                        {tag.postCount}글 · {tag.totalViews.toLocaleString()}조회
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-primary-400 dark:bg-primary-600"
                        style={{ width: `${(tag.totalViews / maxTagViews) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {tagStats.length === 0 && (
                <p className="text-sm text-gray-400">데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
