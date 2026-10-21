import { fetcher } from './client';
import type {
  Post,
  PostListResponse,
  CreatePostDto,
  UpdatePostDto,
  AdjacentPostsResponse,
  LikeStatusResponse,
} from '@silverbeen/types';

export const postsApi = {
  getList: (
    params?: {
      page?: number;
      limit?: number;
      tag?: string;
      sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'title';
      order?: 'asc' | 'desc';
      search?: string;
    },
    options?: { revalidate?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return fetcher<PostListResponse>(`/posts${query ? `?${query}` : ''}`, {
      revalidate: options?.revalidate,
    });
  },

  getBySlug: (slug: string, options?: { revalidate?: number }) =>
    fetcher<Post>(`/posts/${slug}`, { revalidate: options?.revalidate }),

  /** 어드민 전용: 비공개(draft) 글 포함 ID 조회 */
  getAdminById: (id: number) => fetcher<Post>(`/posts/admin/${id}`, { auth: true }),

  incrementView: (slug: string) =>
    fetcher<Post>(`/posts/${slug}/view`, { method: 'POST' }),

  getAdminList: () =>
    fetcher<Post[]>('/posts/admin', {
      auth: true,
    }),

  create: (data: CreatePostDto) =>
    fetcher<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    }),

  update: (id: number, data: UpdatePostDto) =>
    fetcher<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth: true,
    }),

  delete: (id: number) =>
    fetcher<void>(`/posts/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  getAdjacent: (id: number, options?: { revalidate?: number }) =>
    fetcher<AdjacentPostsResponse>(`/posts/${id}/adjacent`, { revalidate: options?.revalidate }),

  toggleLike: (slug: string, fingerprint: string) =>
    fetcher<LikeStatusResponse>(`/posts/${slug}/like`, {
      method: 'POST',
      body: JSON.stringify({ fingerprint }),
    }),

  getLikeStatus: (slug: string, fingerprint: string) =>
    fetcher<LikeStatusResponse>(`/posts/${slug}/like-status?fingerprint=${encodeURIComponent(fingerprint)}`),
};
