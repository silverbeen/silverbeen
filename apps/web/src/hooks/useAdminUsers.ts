'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@silverbeen/types';
import { useAdminResource } from './useAdminResource';
import { useAuthUser } from './useAuthUser';

export function useAdminUsers() {
  const { user: currentUser } = useAuthUser();
  const { data: users, setData: setUsers, loading, error, reload } = useAdminResource<User[]>(
    api.users.getList,
    []
  );

  const updateRole = useCallback(
    async (userId: string, newRole: 'ADMIN' | 'USER') => {
      await api.users.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    },
    [setUsers]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      await api.users.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    },
    [setUsers]
  );

  return {
    users,
    loading,
    error,
    currentUserId: currentUser?.id ?? null,
    updateRole,
    deleteUser,
    refetch: reload,
  };
}
