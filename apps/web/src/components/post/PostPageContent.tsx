'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { usePosts } from '@/hooks/usePosts';
import { TagFilter } from './TagFilter';
import { SortSelector, type SortByType, type OrderType } from './SortSelector';
import { PostsGrid } from './PostsGrid';
import { Pagination } from './Pagination';

export function PostPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortByType;
  const order = (searchParams.get('order') || 'desc') as OrderType;

  const { data } = usePosts({ tag: tag || undefined, page, sortBy, order });

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
      <PostsGrid tag={tag || undefined} page={page} sortBy={sortBy} order={order} />
      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
