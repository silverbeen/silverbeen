import { fetcher } from './client';
import type {
  Post,
  PostListResponse,
  CreatePostDto,
  UpdatePostDto,
  AdjacentPostsResponse,
  LikeStatusResponse,
} from '@/types/post';

export const postsApi = {
  getList: (
    params?: {
      page?: number;
      limit?: number;
      tag?: string;
      sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'title';
      order?: 'asc' | 'desc';
    },
    options?: { revalidate?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    return fetcher<PostListResponse>(`/posts${query ? `?${query}` : ''}`, {
      revalidate: options?.revalidate,
    });
  },

  getBySlug: (slug: string, options?: { revalidate?: number }) =>
    fetcher<Post>(`/posts/${slug}`, { revalidate: options?.revalidate }),

  getById: (id: number, options?: { revalidate?: number }) =>
    fetcher<Post>(`/posts/${id}`, { revalidate: options?.revalidate }),

  incrementView: (slug: string) =>
    fetcher<Post>(`/posts/${slug}/view`, { method: 'POST' }),

  getAdminList: (token: string) =>
    fetcher<Post[]>('/posts/admin', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (data: CreatePostDto, token: string) =>
    fetcher<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: number, data: UpdatePostDto, token: string) =>
    fetcher<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (id: number, token: string) =>
    fetcher<void>(`/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
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
