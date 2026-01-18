'use client';

import { useEffect, useState } from 'react';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

interface GiscusCommentsProps {
  slug: string;
}

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

  return (
    <Giscus
      id="comments"
      repo="silverbeen/silverbeen"
      repoId=""
      category="Blog Comments"
      categoryId=""
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
