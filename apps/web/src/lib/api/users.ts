import { fetcher } from './client';
import type { User } from '@/types/user';

export const usersApi = {
  getList: (token: string) =>
    fetcher<User[]>('/users', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateRole: (id: string, role: 'ADMIN' | 'USER', token: string) =>
    fetcher<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (id: string, token: string) =>
    fetcher<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};
