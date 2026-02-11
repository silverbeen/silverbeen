'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import type { Series } from '@/types/post';

interface SeriesSelectorProps {
  selectedSeriesId: string | null;
  onSeriesChange: (seriesId: string | null) => void;
}

export function SeriesSelector({ selectedSeriesId, onSeriesChange }: SeriesSelectorProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.series.getList().then((data) => {
      setSeriesList(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
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
