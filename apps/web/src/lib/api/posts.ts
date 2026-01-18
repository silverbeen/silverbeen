import { fetcher } from './client';
import type {
  Post,
  PostListResponse,
  CreatePostDto,
  UpdatePostDto,
} from '@/types/blog';

export const postsApi = {
  getList: (params?: { page?: number; limit?: number; tag?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tag) searchParams.set('tag', params.tag);

    const query = searchParams.toString();
    return fetcher<PostListResponse>(`/posts${query ? `?${query}` : ''}`);
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
};
