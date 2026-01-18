'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Post, PostListResponse, CreatePostDto, UpdatePostDto } from '@/types/post';
import { createClient } from '@/lib/supabase/client';

export function usePosts(params?: {
  tag?: string;
  page?: number;
  sortBy?: 'createdAt' | 'viewCount' | 'title';
  order?: 'asc' | 'desc';
}) {
  const [data, setData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getList({
        page: params?.page,
        tag: params?.tag,
        sortBy: params?.sortBy,
        order: params?.order,
      });
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.tag, params?.sortBy, params?.order]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
}

export function useAdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

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
  }, [supabase.auth]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (data: CreatePostDto) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const newPost = await api.blogs.create(data, session.access_token);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = async (id: number, data: UpdatePostDto) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const updatedPost = await api.blogs.update(id, data, session.access_token);
    setPosts((prev) => prev.map((post) => (post.id === id ? updatedPost : post)));
    return updatedPost;
  };

  const deletePost = async (id: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    await api.blogs.delete(id, session.access_token);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

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
