'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TagFilter } from './TagFilter';
import { SortSelector, type SortByType, type OrderType } from './SortSelector';
import { PostsGrid } from './PostsGrid';
import { Pagination } from './Pagination';
import type { PostListResponse } from '@/types/post';

export function PostPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postsData, setPostsData] = useState<PostListResponse | null>(null);

  const tag = searchParams.get('tag');

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const validSortBy: SortByType[] = ['createdAt', 'viewCount', 'title'];
  const rawSortBy = searchParams.get('sortBy');
  const sortBy: SortByType = validSortBy.includes(rawSortBy as SortByType)
    ? (rawSortBy as SortByType)
    : 'createdAt';

  const validOrder: OrderType[] = ['asc', 'desc'];
  const rawOrder = searchParams.get('order');
  const order: OrderType = validOrder.includes(rawOrder as OrderType)
    ? (rawOrder as OrderType)
    : 'desc';

  const handleDataLoaded = useCallback((data: PostListResponse | null) => {
    setPostsData(data);
  }, []);

  const updateParams = (
    newTag: string | null,
    newPage: number,
    newSortBy?: SortByType,
    newOrder?: OrderType
  ) => {
    const params = new URLSearchParams();
    if (newTag) params.set('tag', newTag);
    if (newPage > 1) params.set('page', newPage.toString());
    if (newSortBy && newSortBy !== 'createdAt') params.set('sortBy', newSortBy);
    if (newOrder && newOrder !== 'desc') params.set('order', newOrder);

    const queryString = params.toString();
    router.push(queryString ? `/blog?${queryString}` : '/blog', { scroll: false });
  };

  const handleTagChange = (newTag: string | null) => {
    updateParams(newTag, 1, sortBy, order);
  };

  const handlePageChange = (newPage: number) => {
    updateParams(tag, newPage, sortBy, order);
  };

  const handleSortChange = (newSortBy: SortByType, newOrder: OrderType) => {
    updateParams(tag, 1, newSortBy, newOrder);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <TagFilter currentTag={tag} onTagChange={handleTagChange} />
        <SortSelector sortBy={sortBy} order={order} onSortChange={handleSortChange} />
      </div>
      <PostsGrid tag={tag || undefined} page={page} sortBy={sortBy} order={order} onDataLoaded={handleDataLoaded} />
      {postsData && (
        <Pagination
          currentPage={page}
          totalPages={postsData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
