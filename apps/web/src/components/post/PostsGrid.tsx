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
  initialData?: PostListResponse | null;
  onDataLoaded?: (data: PostListResponse | null) => void;
}

export function PostsGrid({ tag, page, sortBy, order, initialData, onDataLoaded }: PostsGridProps) {
  const { data, loading, error } = usePosts({ tag, page, sortBy, order }, initialData);

  useEffect(() => {
    if (onDataLoaded) {
      if (error || !data) {
        onDataLoaded(null);
      } else {
        onDataLoaded(data);
      }
    }
  }, [data, error, onDataLoaded]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
          >
            <div className="h-52 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex gap-1.5">
                <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="mb-2 h-7 w-4/5 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="mb-4 flex-1 space-y-2">
                <div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700/50">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
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
      {data.posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
