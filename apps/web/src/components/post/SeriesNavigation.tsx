'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { Series, SeriesPost } from '@/types/post';

interface SeriesNavigationProps {
  series: Series;
  currentPostId: number;
}

export function SeriesNavigation({ series, currentPostId }: SeriesNavigationProps) {
  const [expanded, setExpanded] = useState(false);
  const posts = series.posts || [];
  const currentIndex = posts.findIndex((p) => p.id === currentPostId);
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : '-';

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary-500" />
          <div className="text-left">
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400">시리즈</p>
            <p className="font-semibold text-gray-900 dark:text-white">{series.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayIndex}/{posts.length}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-primary-200 px-5 py-3 dark:border-primary-800">
          <ol className="space-y-1">
            {posts.map((post: SeriesPost, index: number) => (
              <li key={post.id}>
                {post.id === currentPostId ? (
                  <span className="flex items-center gap-2 rounded-lg bg-primary-100 px-3 py-2 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    <span className="text-xs text-primary-500">{index + 1}.</span>
                    {post.title}
                  </span>
                ) : (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-primary-100/50 dark:text-gray-400 dark:hover:bg-primary-900/20"
                  >
                    <span className="text-xs text-gray-400">{index + 1}.</span>
                    {post.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
