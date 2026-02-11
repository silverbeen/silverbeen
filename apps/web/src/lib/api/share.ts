import { fetcher } from './client';

export interface ShareLink {
  id: string;
  slug: string;
  type: 'RESUME' | 'PORTFOLIO';
  label?: string | null;
  active: boolean;
  viewCount: number;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const shareApi = {
  getList: (token: string) =>
    fetcher<ShareLink[]>('/share', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getBySlug: (slug: string) =>
    fetcher<ShareLink>(`/share/${slug}`),

  create: (data: { type: 'RESUME' | 'PORTFOLIO'; label?: string; expiresAt?: string }, token: string) =>
    fetcher<ShareLink>('/share', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  toggleActive: (id: string, token: string) =>
    fetcher<ShareLink>(`/share/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (id: string, token: string) =>
    fetcher<void>(`/share/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  incrementView: (slug: string) =>
    fetcher<ShareLink>(`/share/${slug}/view`, { method: 'POST' }),
};
