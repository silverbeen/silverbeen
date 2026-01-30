'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/user';

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      setCurrentUserId(session.user.id);
      const data = await api.users.getList(session.access_token);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = useCallback(
    async (userId: string, newRole: 'ADMIN' | 'USER') => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      await api.users.updateRole(userId, newRole, session.access_token);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    },
    [supabase]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      await api.users.delete(userId, session.access_token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    },
    [supabase]
  );

  return {
    users,
    loading,
    error,
    currentUserId,
    updateRole,
    deleteUser,
    refetch: fetchUsers,
  };
}
