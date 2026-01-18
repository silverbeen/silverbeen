'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface ViewCounterProps {
  slug: string;
  initialCount: number;
}

export function ViewCounter({ slug, initialCount }: ViewCounterProps) {
  const hasIncremented = useRef(false);
  const [viewCount, setViewCount] = useState(initialCount);

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    api.blogs
      .incrementView(slug)
      .then((post) => setViewCount(post.viewCount))
      .catch(console.error);
  }, [slug]);

  return (
    <span className="text-gray-500 dark:text-gray-400">{viewCount.toLocaleString()} views</span>
  );
}
