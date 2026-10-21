import type { ShareLink, CreateShareLinkDto } from '@silverbeen/types';
import { fetcher } from './client';

export const shareApi = {
  getList: () =>
    fetcher<ShareLink[]>('/share', {
      auth: true,
    }),

  getBySlug: (slug: string) =>
    fetcher<ShareLink>(`/share/${slug}`),

  create: (data: CreateShareLinkDto) =>
    fetcher<ShareLink>('/share', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    }),

  toggleActive: (id: string) =>
    fetcher<ShareLink>(`/share/${id}/toggle`, {
      method: 'PATCH',
      auth: true,
    }),

  delete: (id: string) =>
    fetcher<void>(`/share/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  incrementView: (slug: string) =>
    fetcher<ShareLink>(`/share/${slug}/view`, { method: 'POST' }),
};
