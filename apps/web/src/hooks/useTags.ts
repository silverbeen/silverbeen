'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Tag, CreateTagDto } from '@/types/blog';
import { createClient } from '@/lib/supabase/client';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.tags.getList();
      setTags(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (data: CreateTagDto) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const newTag = await api.tags.create(data, session.access_token);
    setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
    return newTag;
  };

  const deleteTag = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    await api.tags.delete(id, session.access_token);
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
    createTag,
    deleteTag,
  };
}
