'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '@/lib/api';
import type { Post, PostListResponse, CreatePostDto, UpdatePostDto } from '@/types/post';
import { createClient } from '@/lib/supabase/client';

export function usePosts(
  params?: {
    tag?: string;
    page?: number;
    sortBy?: 'createdAt' | 'viewCount' | 'title';
    order?: 'asc' | 'desc';
    search?: string;
  },
  initialData?: PostListResponse | null
) {
  const [data, setData] = useState<PostListResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const isInitialRef = useRef(!!initialData);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getList(
        {
          page: params?.page,
          tag: params?.tag,
          sortBy: params?.sortBy,
          order: params?.order,
          search: params?.search,
        },
        { revalidate: 60 }
      );
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.tag, params?.sortBy, params?.order, params?.search]);

  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.blogs.getBySlug(slug);
        setPost(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}

export function useAdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      const response = await api.blogs.getAdminList(session.access_token);
      setPosts(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(async (data: CreatePostDto) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const newPost = await api.blogs.create(data, session.access_token);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  }, [supabase]);

  const updatePost = useCallback(async (id: number, data: UpdatePostDto) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const updatedPost = await api.blogs.update(id, data, session.access_token);
    setPosts((prev) => prev.map((post) => (post.id === id ? updatedPost : post)));
    return updatedPost;
  }, [supabase]);

  const deletePost = useCallback(async (id: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    await api.blogs.delete(id, session.access_token);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }, [supabase]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}
