'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { usePosts } from '@/hooks/usePosts';
import { useTags } from '@/hooks/useTags';
import { PostCard } from '@/components/post/PostCard';

function TagFilter({
  currentTag,
  onTagChange,
}: {
  currentTag: string | null;
  onTagChange: (tag: string | null) => void;
}) {
  const { tags, loading } = useTags();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          !currentTag
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
        }`}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagChange(tag.name)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            currentTag === tag.name
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
          }`}
        >
          {tag.name}
          {tag._count && <span className="ml-1.5 text-xs opacity-70">({tag._count.posts})</span>}
        </button>
      ))}
    </div>
  );
}

function SortSelector({
  sortBy,
  order,
  onSortChange,
}: {
  sortBy: 'createdAt' | 'viewCount' | 'title';
  order: 'asc' | 'desc';
  onSortChange: (sortBy: 'createdAt' | 'viewCount' | 'title', order: 'asc' | 'desc') => void;
}) {
  const sortOptions = [
    { value: 'createdAt-desc', label: '최신순' },
    { value: 'createdAt-asc', label: '오래된순' },
    { value: 'viewCount-desc', label: '조회순' },
    { value: 'title-asc', label: '제목순' },
  ];

  const currentValue = `${sortBy}-${order}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newOrder] = e.target.value.split('-') as [
      'createdAt' | 'viewCount' | 'title',
      'asc' | 'desc',
    ];
    onSortChange(newSortBy, newOrder);
  };

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function PostsGrid({
  tag,
  page,
  sortBy,
  order,
}: {
  tag?: string;
  page: number;
  sortBy: 'createdAt' | 'viewCount' | 'title';
  order: 'asc' | 'desc';
}) {
  const { data, loading, error } = usePosts({ tag, page, sortBy, order });

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

function Pagination({
  currentPage,
  totalPages,
  tag,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  tag: string | null;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
            pageNum === currentPage
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500'
          }`}
        >
          {pageNum}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function PostPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'viewCount' | 'title';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

  const { data } = usePosts({ tag: tag || undefined, page, sortBy, order });

  const updateParams = (
    newTag: string | null,
    newPage: number,
    newSortBy?: 'createdAt' | 'viewCount' | 'title',
    newOrder?: 'asc' | 'desc'
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

  const handleSortChange = (
    newSortBy: 'createdAt' | 'viewCount' | 'title',
    newOrder: 'asc' | 'desc'
  ) => {
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
          tag={tag}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
