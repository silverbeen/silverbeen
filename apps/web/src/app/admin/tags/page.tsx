'use client';

import { useState } from 'react';
import { useTags } from '@/hooks/useTags';
import { useToast, useConfirm } from '@/components/ui';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ApiError } from '@/lib/api';
import type { Tag } from '@silverbeen/types';

/** 백엔드가 중복 태그명에 409 Conflict 반환 */
function isDuplicateError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

export default function AdminTagsPage() {
  const { tags, loading, error, refetch, createTag, deleteTag, updateTag } = useTags();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      await createTag({ name: newTagName.trim() });
      setNewTagName('');
      toast('태그가 생성되었습니다.', 'success');
    } catch (err) {
      if (isDuplicateError(err)) {
        toast('이미 존재하는 태그입니다.', 'error');
      } else {
        toast('태그 생성에 실패했습니다.', 'error');
      }
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    const postCount = tag._count?.posts ?? 0;
    const message = postCount > 0
      ? `"${tag.name}" 태그를 삭제하시겠습니까? (${postCount}개의 포스트에서 제거됩니다)`
      : `"${tag.name}" 태그를 삭제하시겠습니까?`;

    const confirmed = await confirm({
      title: '태그 삭제',
      message,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });

    if (!confirmed) return;

    setDeletingId(tag.id);
    try {
      await deleteTag(tag.id);
      toast('태그가 삭제되었습니다.', 'success');
    } catch (err) {
      toast('삭제에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditStart = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSave = async (tag: Tag) => {
    if (!editingName.trim() || editingName.trim() === tag.name) {
      handleEditCancel();
      return;
    }

    setIsSaving(true);
    try {
      await updateTag(tag.id, { name: editingName.trim() });
      toast('태그가 수정되었습니다.', 'success');
      handleEditCancel();
    } catch (err) {
      if (isDuplicateError(err)) {
        toast('이미 존재하는 태그입니다.', 'error');
      } else {
        toast('수정에 실패했습니다.', 'error');
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPageShell title="태그 관리" maxWidth="4xl" loading={loading} error={error} onRetry={refetch}>
      {/* 태그 생성 폼 */}
      <form onSubmit={handleCreate} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="새 태그 이름"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !newTagName.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? '생성 중...' : '태그 추가'}
          </button>
        </div>
      </form>

      {tags.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            아직 등록된 태그가 없습니다.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  태그 이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  포스트 수
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => !isSaving && setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (isSaving) return;
                          if (e.key === 'Enter') handleEditSave(tag);
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        disabled={isSaving}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {tag.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {tag._count?.posts ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === tag.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(tag)}
                          disabled={isSaving}
                          className="text-primary-500 hover:text-primary-600 text-sm disabled:opacity-50"
                        >
                          {isSaving ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          disabled={isSaving}
                          className="text-gray-500 hover:text-gray-600 text-sm disabled:opacity-50"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditStart(tag)}
                          className="text-primary-500 hover:text-primary-600 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          disabled={deletingId === tag.id}
                          className="text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
                        >
                          {deletingId === tag.id ? '삭제 중...' : '삭제'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        총 {tags.length}개의 태그
      </div>
    </AdminPageShell>
  );
}
