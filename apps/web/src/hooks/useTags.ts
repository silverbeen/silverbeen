'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '@silverbeen/types';
import { useAdminResource } from './useAdminResource';

const sortByName = (tags: Tag[]) => [...tags].sort((a, b) => a.name.localeCompare(b.name));

/**
 * 어드민 태그 CRUD 훅 (태그 관리 페이지, 글 에디터)
 */
export function useTags() {
  const { data: tags, setData: setTags, loading, error, reload } = useAdminResource<Tag[]>(
    api.tags.getList,
    []
  );

  const createTag = useCallback(
    async (data: CreateTagDto) => {
      const newTag = await api.tags.create(data);
      setTags((prev) => sortByName([...prev, newTag]));
      return newTag;
    },
    [setTags]
  );

  const updateTag = useCallback(
    async (id: string, data: UpdateTagDto) => {
      const updatedTag = await api.tags.update(id, data);
      setTags((prev) => sortByName(prev.map((tag) => (tag.id === id ? { ...tag, ...updatedTag } : tag))));
      return updatedTag;
    },
    [setTags]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      await api.tags.delete(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    },
    [setTags]
  );

  return {
    tags,
    loading,
    error,
    refetch: reload,
    createTag,
    updateTag,
    deleteTag,
  };
}
