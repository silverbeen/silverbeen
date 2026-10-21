'use client';

import { useState } from 'react';
import { Plus, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast, useConfirm } from '@/components/ui';
import { AdminPageShell, AdminSkeleton } from '@/components/admin/AdminPageShell';
import { useAdminResource } from '@/hooks/useAdminResource';
import { formatDate } from '@/utils/date';
import { config } from '@/config';
import type { ShareLink } from '@silverbeen/types';

export default function AdminSharePage() {
  const { data: links, loading, error, reload } = useAdminResource<ShareLink[]>(api.share.getList, []);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'RESUME' | 'PORTFOLIO'>('RESUME');
  const [label, setLabel] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const handleCreate = async () => {
    try {
      await api.share.create({ type, label: label.trim() || undefined });
      toast('공유 링크가 생성되었습니다.', 'success');
      setShowForm(false);
      setLabel('');
      void reload();
    } catch {
      toast('공유 링크 생성에 실패했습니다.', 'error');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.share.toggleActive(id);
      void reload();
    } catch {
      toast('상태 변경에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '공유 링크 삭제',
      message: '이 공유 링크를 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.share.delete(id);
      toast('공유 링크가 삭제되었습니다.', 'success');
      void reload();
    } catch {
      toast('삭제에 실패했습니다.', 'error');
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${config.siteUrl}/s/${slug}`)
      .then(() => toast('링크가 복사되었습니다.', 'success'))
      .catch(() => toast('링크 복사에 실패했습니다.', 'error'));
  };

  return (
    <AdminPageShell
      title="공유 링크 관리"
      maxWidth="4xl"
      actions={
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          새 링크
        </button>
      }
      loading={loading}
      error={error}
      onRetry={reload}
      skeleton={<AdminSkeleton blocks={3} blockClassName="h-20" />}
    >
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">새 공유 링크</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              {(['RESUME', 'PORTFOLIO'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t === 'RESUME' ? '이력서' : '포트폴리오'}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="라벨 (예: 구글 지원용)"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
                생성
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          아직 생성된 공유 링크가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex items-center justify-between rounded-xl border bg-white p-5 dark:bg-gray-800 ${
                link.active ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 opacity-60 dark:border-red-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    link.type === 'RESUME'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {link.type === 'RESUME' ? '이력서' : '포트폴리오'}
                  </span>
                  {link.label && (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</span>
                  )}
                  {!link.active && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">비활성</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span>{config.siteUrl}/s/{link.slug}</span>
                  <span>·</span>
                  <span>조회 {link.viewCount}회</span>
                  <span>·</span>
                  <span>{formatDate(link.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => copyLink(link.slug)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" title="링크 복사">
                  <Copy className="h-4 w-4" />
                </button>
                <a href={`/s/${link.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" title="미리보기">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => handleToggle(link.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" title={link.active ? '비활성화' : '활성화'}>
                  {link.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <button onClick={() => handleDelete(link.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20" title="삭제">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
