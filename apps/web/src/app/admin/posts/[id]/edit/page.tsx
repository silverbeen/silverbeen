'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PostEditor, type PostFormData } from '@/components/post/PostEditor';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { useAdminResource } from '@/hooks/useAdminResource';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui';
import type { Post } from '@silverbeen/types';

function parsePostId(rawId: unknown): number | null {
  return typeof rawId === 'string' && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
}

export default function EditPostPage() {
  const params = useParams();
  const id = parsePostId(params.id);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const loadPost = useCallback(async () => {
    if (id === null) throw new Error('잘못된 글 ID입니다.');
    try {
      return await api.blogs.getAdminById(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        throw new Error('글을 찾을 수 없습니다.');
      }
      throw err;
    }
  }, [id]);

  const { data: post, setData: setPost, loading, error, reload } = useAdminResource<Post | null>(
    loadPost,
    null
  );

  const handleSave = async (data: PostFormData) => {
    // seriesId: null을 그대로 보내 시리즈 연결 해제를 반영
    if (id === null) return;
    setSaving(true);
    try {
      const updatedPost = await api.blogs.update(id, data);
      setPost(updatedPost);
      toast(data.published ? '글이 발행되었습니다.' : '저장되었습니다.', 'success');
    } catch (err) {
      toast('저장에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="글 수정"
      backHref="/admin/posts"
      backLabel="글 목록으로 돌아가기"
      maxWidth="7xl"
      loading={loading}
      error={error ?? (post ? null : new Error('글을 찾을 수 없습니다.'))}
      onRetry={reload}
      actions={
        post?.published && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="text-primary-500 hover:text-primary-600 text-sm"
          >
            게시글 보기 →
          </Link>
        )
      }
    >
      {post && (
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <PostEditor initialData={post} onSave={handleSave} saving={saving} />
        </div>
      )}
    </AdminPageShell>
  );
}
