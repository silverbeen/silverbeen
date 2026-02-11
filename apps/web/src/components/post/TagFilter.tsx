'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTags } from '@/hooks/useTags';

const TAG_BUTTON_STYLE = {
  active: 'bg-primary-500 text-white shadow-lg shadow-primary-500/25',
  inactive:
    'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500',
};

interface TagFilterProps {
  currentTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ currentTag, onTagChange }: TagFilterProps) {
  const { tags, loading } = useTags();
  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => (b._count?.posts ?? 0) - (a._count?.posts ?? 0)),
    [tags],
  );
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const check = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 4);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tags]);

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
    <div className="flex items-start gap-2">
      <div
        ref={containerRef}
        className={`flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96' : 'max-h-10'
        }`}
      >
        <button
          onClick={() => onTagChange(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            !currentTag ? TAG_BUTTON_STYLE.active : TAG_BUTTON_STYLE.inactive
          }`}
        >
          전체
        </button>
        {sortedTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagChange(tag.name)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              currentTag === tag.name ? TAG_BUTTON_STYLE.active : TAG_BUTTON_STYLE.inactive
            }`}
          >
            {tag.name}
            {tag._count && <span className="ml-1.5 text-xs opacity-70">({tag._count.posts})</span>}
          </button>
        ))}
      </div>
      {(isOverflowing || expanded) && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 rounded-full border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-primary-400"
          aria-label={expanded ? '태그 접기' : '태그 더보기'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
