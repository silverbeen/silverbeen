'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PostEditor } from '@/components/post/PostEditor';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
import type { Post, CreatePostDto } from '@/types/post';

export default function EditPostPage() {
  const params = useParams();
  const rawId = params.id as string;
  const isValidId = typeof rawId === 'string' && /^\d+$/.test(rawId);
  const id = isValidId ? parseInt(rawId, 10) : NaN;
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!isValidId || isNaN(id)) {
      setError(new Error('Invalid post id'));
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const foundPost = await api.blogs.getById(id);

        if (!foundPost) {
          throw new Error('Post not found');
        }

        setPost(foundPost);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isValidId]);

  const handleSave = async (data: CreatePostDto) => {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const updatedPost = await api.blogs.update(id, data, session.access_token);
      setPost(updatedPost);
      toast(data.published ? '글이 발행되었습니다.' : '저장되었습니다.', 'success');
    } catch (err) {
      toast('저장에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-96 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/posts"
            className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← 글 목록으로 돌아가기
          </Link>
          <div className="text-red-500 dark:text-red-400">
            {error?.message || '글을 찾을 수 없습니다.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <Link
            href="/admin/posts"
            className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← 글 목록으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">글 수정</h1>
            {post.published && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                게시글 보기 →
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <PostEditor initialData={post} onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}
