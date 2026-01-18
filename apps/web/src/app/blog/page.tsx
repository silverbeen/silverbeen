import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PostPageContent } from '@/components/post/PostPageContent';
import { WritePostButton } from '@/components/post/WritePostButton';

export const metadata: Metadata = {
  title: '블로그 | Silverbeen',
  description: '개발 관련 글과 경험을 공유합니다.',
};

function BlogPageSkeleton() {
  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-700/50 dark:bg-gray-800/50"
          >
            <div className="h-32 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
            <div className="space-y-4 p-6">
              <div className="flex gap-2">
                <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="h-5 w-4/5 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Blog
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            개발 관련 글과 경험을 공유합니다.
          </p>
        </header>

        <Suspense fallback={<BlogPageSkeleton />}>
          <PostPageContent />
        </Suspense>
      </div>

      <WritePostButton />
    </div>
  );
}
