'use client';

import { useTags } from '@/hooks/useTags';

interface TagFilterProps {
  currentTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ currentTag, onTagChange }: TagFilterProps) {
  const { tags, loading } = useTags();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          !currentTag
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
        }`}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagChange(tag.name)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            currentTag === tag.name
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
          }`}
        >
          {tag.name}
          {tag._count && <span className="ml-1.5 text-xs opacity-70">({tag._count.posts})</span>}
        </button>
      ))}
    </div>
  );
}
