import { fetcher } from './client';
import type { Series, CreateSeriesDto, UpdateSeriesDto } from '@silverbeen/types';

export const seriesApi = {
  getList: (options?: { revalidate?: number }) =>
    fetcher<Series[]>('/series', { revalidate: options?.revalidate }),

  getBySlug: (slug: string, options?: { revalidate?: number }) =>
    fetcher<Series>(`/series/${slug}`, { revalidate: options?.revalidate }),

  create: (data: CreateSeriesDto) =>
    fetcher<Series>('/series', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    }),

  update: (id: string, data: UpdateSeriesDto) =>
    fetcher<Series>(`/series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth: true,
    }),

  delete: (id: string) =>
    fetcher<void>(`/series/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  updatePostOrder: (id: string, postIds: number[]) =>
    fetcher<Series>(`/series/${id}/order`, {
      method: 'PUT',
      body: JSON.stringify({ postIds }),
      auth: true,
    }),
};
