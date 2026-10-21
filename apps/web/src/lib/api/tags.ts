import { fetcher } from './client';
import type { Tag, CreateTagDto, UpdateTagDto } from '@silverbeen/types';

export const tagsApi = {
  getList: () => fetcher<Tag[]>('/tags'),

  create: (data: CreateTagDto) =>
    fetcher<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    }),

  update: (id: string, data: UpdateTagDto) =>
    fetcher<Tag>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      auth: true,
    }),

  delete: (id: string) =>
    fetcher<void>(`/tags/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
};
