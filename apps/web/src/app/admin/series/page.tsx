'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
import type { Series } from '@/types/post';

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const fetchSeries = useCallback(async () => {
    try {
      const data = await api.series.getList();
      setSeriesList(data);
    } catch {
      toast('시리즈 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return session.access_token;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast('제목을 입력해주세요.', 'warning');
      return;
    }

    try {
      const token = await getToken();
      if (editingId) {
        await api.series.update(editingId, { title: title.trim(), description: description.trim() || undefined }, token);
        toast('시리즈가 수정되었습니다.', 'success');
      } else {
        await api.series.create({ title: title.trim(), description: description.trim() || undefined }, token);
        toast('시리즈가 생성되었습니다.', 'success');
      }
      resetForm();
      fetchSeries();
    } catch {
      toast('시리즈 저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 시리즈를 삭제하시겠습니까? 포함된 글의 시리즈 연결이 해제됩니다.')) return;

    try {
      const token = await getToken();
      await api.series.delete(id, token);
      toast('시리즈가 삭제되었습니다.', 'success');
      fetchSeries();
    } catch {
      toast('시리즈 삭제에 실패했습니다.', 'error');
    }
  };

  const handleEdit = (series: Series) => {
    setEditingId(series.id);
    setTitle(series.title);
    setDescription(series.description || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">시리즈 관리</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 시리즈
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? '시리즈 수정' : '새 시리즈'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="시리즈 제목"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="시리즈 설명 (선택)"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  {editingId ? '수정' : '생성'}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : seriesList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            아직 생성된 시리즈가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {seriesList.map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{series.title}</h3>
                    {series.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{series.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {series._count?.posts || 0}개의 글
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(series)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(series.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
