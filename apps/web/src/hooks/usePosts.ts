'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { Post, UpdatePostDto } from '@silverbeen/types';
import { useAdminResource } from './useAdminResource';

/**
 * 어드민 글 목록 (비공개 글 포함) + 수정/삭제
 */
export function useAdminPosts() {
  const { data: posts, setData: setPosts, loading, error, reload } = useAdminResource<Post[]>(
    api.blogs.getAdminList,
    []
  );

  const updatePost = useCallback(
    async (id: number, data: UpdatePostDto) => {
      const updatedPost = await api.blogs.update(id, data);
      setPosts((prev) => prev.map((post) => (post.id === id ? updatedPost : post)));
      return updatedPost;
    },
    [setPosts]
  );

  const deletePost = useCallback(
    async (id: number) => {
      await api.blogs.delete(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    },
    [setPosts]
  );

  return {
    posts,
    loading,
    error,
    refetch: reload,
    updatePost,
    deletePost,
  };
}
