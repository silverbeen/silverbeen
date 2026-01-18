'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface ViewCounterProps {
  slug: string;
  initialCount: number;
}

export function ViewCounter({ slug, initialCount }: ViewCounterProps) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;

    const viewedKey = `viewed_${slug}`;
    const viewed = localStorage.getItem(viewedKey);
    const now = Date.now();

    if (viewed) {
      const viewedTime = parseInt(viewed, 10);
      const hourInMs = 60 * 60 * 1000;
      if (now - viewedTime < hourInMs) {
        return;
      }
    }

    hasIncremented.current = true;
    localStorage.setItem(viewedKey, now.toString());

    api.posts.incrementView(slug).catch(console.error);
  }, [slug]);

  return (
    <span className="text-gray-500 dark:text-gray-400">
      {initialCount.toLocaleString()} views
    </span>
  );
}
