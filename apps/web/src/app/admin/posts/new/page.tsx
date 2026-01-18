'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useAdminPosts } from '@/hooks/usePosts';
import type { CreatePostDto } from '@/types/blog';

export default function NewPostPage() {
  const router = useRouter();
  const { createPost } = useAdminPosts();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: CreatePostDto) => {
    setSaving(true);
    try {
      const post = await createPost(data);
      alert(data.published ? '글이 발행되었습니다.' : '임시저장되었습니다.');
      router.push(`/admin/posts/${post.id}/edit`);
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 글 작성
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <BlogEditor onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}
