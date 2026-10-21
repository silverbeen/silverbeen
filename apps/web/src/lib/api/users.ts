import { fetcher } from './client';
import type { User } from '@silverbeen/types';

export const usersApi = {
  getList: () =>
    fetcher<User[]>('/users', {
      auth: true,
    }),

  updateRole: (id: string, role: 'ADMIN' | 'USER') =>
    fetcher<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      auth: true,
    }),

  delete: (id: string) =>
    fetcher<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
};
