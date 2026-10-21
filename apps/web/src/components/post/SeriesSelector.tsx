'use client';

import { BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminResource } from '@/hooks/useAdminResource';
import type { Series } from '@silverbeen/types';

const loadSeries = () => api.series.getList();

interface SeriesSelectorProps {
  selectedSeriesId: string | null;
  onSeriesChange: (seriesId: string | null) => void;
}

export function SeriesSelector({ selectedSeriesId, onSeriesChange }: SeriesSelectorProps) {
  const { data: seriesList, loading, error, reload } = useAdminResource<Series[]>(loadSeries, []);

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
      >
        <span>시리즈 목록을 불러오지 못했습니다.</span>
        <button type="button" onClick={reload} className="font-medium underline">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={selectedSeriesId || ''}
        onChange={(e) => onSeriesChange(e.target.value || null)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
      >
        <option value="">시리즈 없음</option>
        {seriesList.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}
