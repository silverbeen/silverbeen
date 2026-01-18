'use client';

import { useEffect, useState } from 'react';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

interface GiscusCommentsProps {
  slug: string;
}

const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO || 'silverbeen/silverbeen';
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
        댓글을 불러오는 중...
      </div>
    );
  }

  if (!GISCUS_REPO_ID || !GISCUS_CATEGORY_ID) {
    console.error('Giscus configuration missing: NEXT_PUBLIC_GISCUS_REPO_ID and NEXT_PUBLIC_GISCUS_CATEGORY_ID must be set in .env.local');
    return (
      <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
        댓글을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={GISCUS_REPO as `${string}/${string}`}
      repoId={GISCUS_REPO_ID}
      category="Blog Comments"
      categoryId={GISCUS_CATEGORY_ID}
      mapping="specific"
      term={slug}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      lang="ko"
      loading="lazy"
    />
  );
}
