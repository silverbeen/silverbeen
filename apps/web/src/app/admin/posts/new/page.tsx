'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostEditor, type PostFormData } from '@/components/post/PostEditor';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui';

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async ({ seriesId, ...data }: PostFormData) => {
    setSaving(true);
    try {
      // 새 글은 시리즈가 없으면 필드 자체를 생략
      const post = await api.blogs.create({ ...data, seriesId: seriesId ?? undefined });
      toast(data.published ? '글이 발행되었습니다.' : '임시저장되었습니다.', 'success');
      router.push(`/admin/posts/${post.id}/edit`);
    } catch (err) {
      toast('저장에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell title="새 글 작성" backHref="/admin/posts" backLabel="글 목록으로 돌아가기" maxWidth="7xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <PostEditor onSave={handleSave} saving={saving} />
      </div>
    </AdminPageShell>
  );
}
