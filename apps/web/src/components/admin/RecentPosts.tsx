'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminResource } from '@/hooks/useAdminResource';
import { formatShortDate } from '@/utils/date';
import type { Post } from '@silverbeen/types';

const RECENT_POSTS_LIMIT = 5;

async function loadRecentPosts(): Promise<Post[]> {
  const posts = await api.blogs.getAdminList();
  return posts.slice(0, RECENT_POSTS_LIMIT);
}

export function RecentPosts() {
  const { data: posts, loading, error, reload } = useAdminResource(loadRecentPosts, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[...Array(RECENT_POSTS_LIMIT)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          최근 게시글
        </h2>
        <Link
          href="/admin/posts"
          className="text-sm text-primary-500 hover:text-primary-600"
        >
          전체보기
        </Link>
      </div>

      {error ? (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400">
          게시글을 불러오지 못했습니다.{' '}
          <button type="button" onClick={reload} className="font-medium underline">
            다시 시도
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex min-w-10 justify-center px-1.5 py-0.5 text-xs font-medium rounded ${
                      post.published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {post.published ? '발행' : '임시'}
                  </span>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 truncate"
                  >
                    {post.title}
                  </Link>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatShortDate(post.createdAt)} · 조회 {post.viewCount}
                </p>
              </div>
              {post.published && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="새 탭에서 보기"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
