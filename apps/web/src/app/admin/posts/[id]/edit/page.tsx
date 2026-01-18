'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Post, CreatePostDto } from '@/types/blog';

export default function EditPostPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const posts = await api.posts.getAdminList(session.access_token);
        const foundPost = posts.find((p) => p.id === id);

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
  }, [id, supabase.auth]);

  const handleSave = async (data: CreatePostDto) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const updatedPost = await api.posts.update(id, data, session.access_token);
      setPost(updatedPost);
      alert(data.published ? '글이 발행되었습니다.' : '저장되었습니다.');
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin/posts"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 inline-block"
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
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link
            href="/admin/posts"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
          >
            ← 글 목록으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              글 수정
            </h1>
            {post.published && (
              <Link
                href={`/post/${post.id}`}
                target="_blank"
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                게시글 보기 →
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <BlogEditor initialData={post} onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}
