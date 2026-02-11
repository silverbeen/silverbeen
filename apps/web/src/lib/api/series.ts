import { fetcher } from './client';
import type { Series, CreateSeriesDto, UpdateSeriesDto } from '@/types/post';

export const seriesApi = {
  getList: (options?: { revalidate?: number }) =>
    fetcher<Series[]>('/series', { revalidate: options?.revalidate }),

  getBySlug: (slug: string, options?: { revalidate?: number }) =>
    fetcher<Series>(`/series/${slug}`, { revalidate: options?.revalidate }),

  getById: (id: string, options?: { revalidate?: number }) =>
    fetcher<Series>(`/series/${id}`, { revalidate: options?.revalidate }),

  create: (data: CreateSeriesDto, token: string) =>
    fetcher<Series>('/series', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: string, data: UpdateSeriesDto, token: string) =>
    fetcher<Series>(`/series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (id: string, token: string) =>
    fetcher<void>(`/series/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  updatePostOrder: (id: string, postIds: number[], token: string) =>
    fetcher<Series>(`/series/${id}/order`, {
      method: 'PUT',
      body: JSON.stringify({ postIds }),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
