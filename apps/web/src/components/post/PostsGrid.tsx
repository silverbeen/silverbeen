'use client';

import { useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from './PostCard';
import type { SortByType, OrderType } from './SortSelector';
import type { PostListResponse } from '@/types/post';

interface PostsGridProps {
  tag?: string;
  page: number;
  sortBy: SortByType;
  order: OrderType;
  onDataLoaded?: (data: PostListResponse | null) => void;
}

export function PostsGrid({ tag, page, sortBy, order, onDataLoaded }: PostsGridProps) {
  const { data, loading, error } = usePosts({ tag, page, sortBy, order });

  useEffect(() => {
    if (onDataLoaded) {
      onDataLoaded(data);
    }
  }, [data, onDataLoaded]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
          >
            <div className="h-32 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="h-5 w-4/5 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 dark:text-red-400">글을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {tag ? `"${tag}" 태그의 글이 없습니다.` : '아직 작성된 글이 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
