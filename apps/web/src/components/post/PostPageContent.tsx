'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TagFilter } from './TagFilter';
import { SearchInput } from './SearchInput';
import { SortSelector, type SortByType, type OrderType } from './SortSelector';
import { PostsGrid } from './PostsGrid';
import { Pagination } from './Pagination';
import type { PostListResponse } from '@/types/post';

interface PostPageContentProps {
  initialData: PostListResponse | null;
  initialTag: string | null;
  initialPage: number;
  initialSortBy: SortByType;
  initialOrder: OrderType;
  initialSearch: string;
}

export function PostPageContent({
  initialData,
  initialTag,
  initialPage,
  initialSortBy,
  initialOrder,
  initialSearch,
}: PostPageContentProps) {
  const router = useRouter();
  const [postsData, setPostsData] = useState<PostListResponse | null>(initialData);
  const [tag, setTag] = useState<string | null>(initialTag);
  const [page, setPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<SortByType>(initialSortBy);
  const [order, setOrder] = useState<OrderType>(initialOrder);
  const [search, setSearch] = useState(initialSearch);

  const stateRef = useRef({ tag, page, sortBy, order, search });
  stateRef.current = { tag, page, sortBy, order, search };

  const handleDataLoaded = useCallback((data: PostListResponse | null) => {
    setPostsData(data);
  }, []);

  const updateParams = useCallback(
    (
      newTag: string | null,
      newPage: number,
      newSortBy: SortByType,
      newOrder: OrderType,
      newSearch?: string,
    ) => {
      setTag(newTag);
      setPage(newPage);
      setSortBy(newSortBy);
      setOrder(newOrder);
      if (newSearch !== undefined) setSearch(newSearch);

      const params = new URLSearchParams();
      if (newTag) params.set('tag', newTag);
      if (newPage > 1) params.set('page', newPage.toString());
      if (newSortBy !== 'createdAt') params.set('sortBy', newSortBy);
      if (newOrder !== 'desc') params.set('order', newOrder);
      const searchValue = newSearch !== undefined ? newSearch : stateRef.current.search;
      if (searchValue) params.set('search', searchValue);

      const queryString = params.toString();
      router.replace(queryString ? `/blog?${queryString}` : '/blog', { scroll: false });
    },
    [router],
  );

  const handleTagChange = useCallback(
    (newTag: string | null) => {
      const { sortBy, order } = stateRef.current;
      updateParams(newTag, 1, sortBy, order);
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const { tag, sortBy, order } = stateRef.current;
      updateParams(tag, newPage, sortBy, order);
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (newSortBy: SortByType, newOrder: OrderType) => {
      const { tag } = stateRef.current;
      updateParams(tag, 1, newSortBy, newOrder);
    },
    [updateParams],
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      const { tag, sortBy, order } = stateRef.current;
      updateParams(tag, 1, sortBy, order, newSearch);
    },
    [updateParams],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <TagFilter currentTag={tag} onTagChange={handleTagChange} />
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={handleSearchChange} />
          <SortSelector sortBy={sortBy} order={order} onSortChange={handleSortChange} />
        </div>
      </div>
      <PostsGrid
        tag={tag || undefined}
        page={page}
        sortBy={sortBy}
        order={order}
        search={search || undefined}
        initialData={initialData}
        onDataLoaded={handleDataLoaded}
      />
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
