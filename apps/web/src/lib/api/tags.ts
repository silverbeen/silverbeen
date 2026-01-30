import { fetcher } from './client';
import type { Tag, CreateTagDto, UpdateTagDto } from '@/types/post';

export const tagsApi = {
  getList: () => fetcher<Tag[]>('/tags'),

  create: (data: CreateTagDto, token: string) =>
    fetcher<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: string, data: UpdateTagDto, token: string) =>
    fetcher<Tag>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (id: string, token: string) =>
    fetcher<void>(`/tags/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};
