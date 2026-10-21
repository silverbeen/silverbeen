'use client';

import { useCallback, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TagFilter } from './TagFilter';
import { SearchInput } from './SearchInput';
import { SortSelector, type SortByType, type OrderType } from './SortSelector';
import { PostsGrid } from './PostsGrid';
import { Pagination } from './Pagination';
import { buildBlogQueryString, type BlogQuery } from '@/utils/blogQuery';
import type { PostListResponse, Tag } from '@silverbeen/types';

interface PostPageContentProps {
  /** 서버(BlogPage)에서 URL 쿼리 기준으로 조회한 결과. 실패 시 null */
  posts: PostListResponse | null;
  tags: Tag[];
  query: BlogQuery;
}

/**
 * 블로그 목록 UI. 데이터는 서버에서만 조회하고, 여기서는 URL만 갱신한다.
 * (router.replace → 서버 컴포넌트 재렌더링 → 새 props)
 */
export function PostPageContent({ posts, tags, query }: PostPageContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // 서버 응답 전에도 선택한 탭/정렬/페이지가 즉시 반영되도록 낙관적 상태 사용
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  const navigate = useCallback(
    (patch: Partial<BlogQuery>) => {
      const next: BlogQuery = { ...optimisticQuery, page: 1, ...patch };
      startTransition(() => {
        setOptimisticQuery(next);
        router.replace(`/blog${buildBlogQueryString(next)}`, { scroll: false });
      });
    },
    [optimisticQuery, router, setOptimisticQuery],
  );

  const handleTagChange = useCallback((tag: string | null) => navigate({ tag }), [navigate]);
  const handlePageChange = useCallback((page: number) => navigate({ page }), [navigate]);
  const handleSortChange = useCallback(
    (sortBy: SortByType, order: OrderType) => navigate({ sortBy, order }),
    [navigate],
  );
  const handleSearchChange = useCallback((search: string) => navigate({ search }), [navigate]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <TagFilter tags={tags} currentTag={optimisticQuery.tag} onTagChange={handleTagChange} />
        <div className="flex items-center gap-3">
          <SearchInput value={query.search} onChange={handleSearchChange} />
          <SortSelector
            sortBy={optimisticQuery.sortBy}
            order={optimisticQuery.order}
            onSortChange={handleSortChange}
          />
        </div>
      </div>
      <div
        aria-busy={isPending}
        className={`transition-opacity duration-200 ${isPending ? 'pointer-events-none opacity-60' : ''}`}
      >
        <PostsGrid data={posts} tag={query.tag} search={query.search} />
      </div>
      {posts && (
        <Pagination
          currentPage={optimisticQuery.page}
          totalPages={posts.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
