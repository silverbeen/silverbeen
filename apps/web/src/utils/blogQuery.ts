/**
 * 블로그 목록의 URL 쿼리(tag/page/sortBy/order/search) 파싱·직렬화
 * 서버(BlogPage)와 클라이언트(PostPageContent)가 같은 규칙을 공유
 */

export const SORT_BY_VALUES = ['createdAt', 'viewCount', 'likeCount', 'title'] as const;
export const ORDER_VALUES = ['asc', 'desc'] as const;

export type SortByType = (typeof SORT_BY_VALUES)[number];
export type OrderType = (typeof ORDER_VALUES)[number];

export interface BlogQuery {
  tag: string | null;
  page: number;
  sortBy: SortByType;
  order: OrderType;
  search: string;
}

export const DEFAULT_BLOG_QUERY: BlogQuery = {
  tag: null,
  page: 1,
  sortBy: 'createdAt',
  order: 'desc',
  search: '',
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return value !== undefined && (values as readonly string[]).includes(value);
}

export function parseBlogQuery(params: RawParams): BlogQuery {
  const rawPage = Number.parseInt(first(params.page) ?? '', 10);
  const sortBy = first(params.sortBy);
  const order = first(params.order);

  return {
    tag: first(params.tag) || null,
    page: Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage,
    sortBy: isOneOf(SORT_BY_VALUES, sortBy) ? sortBy : DEFAULT_BLOG_QUERY.sortBy,
    order: isOneOf(ORDER_VALUES, order) ? order : DEFAULT_BLOG_QUERY.order,
    search: first(params.search)?.trim() ?? '',
  };
}

/**
 * 기본값은 생략한 쿼리 문자열 ('' 또는 '?tag=...')
 */
export function buildBlogQueryString(query: BlogQuery): string {
  const params = new URLSearchParams();
  if (query.tag) params.set('tag', query.tag);
  if (query.page > 1) params.set('page', String(query.page));
  if (query.sortBy !== DEFAULT_BLOG_QUERY.sortBy) params.set('sortBy', query.sortBy);
  if (query.order !== DEFAULT_BLOG_QUERY.order) params.set('order', query.order);
  if (query.search) params.set('search', query.search);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
