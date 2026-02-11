import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PostPageContent } from '@/components/post/PostPageContent';
import { WritePostButton } from '@/components/post/WritePostButton';
import { api } from '@/lib/api';
import { config } from '@/config';
import type { SortByType, OrderType } from '@/components/post/SortSelector';

export const metadata: Metadata = {
  title: '블로그',
  description: '개발 관련 글과 경험을 공유합니다.',
  openGraph: {
    title: `블로그 | ${config.siteName}`,
    description: '개발 관련 글과 경험을 공유합니다.',
    url: `${config.siteUrl}/blog`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `블로그 | ${config.siteName}`,
    description: '개발 관련 글과 경험을 공유합니다.',
  },
  alternates: {
    canonical: `${config.siteUrl}/blog`,
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string;
    page?: string;
    sortBy?: string;
    order?: string;
    search?: string;
  }>;
}

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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const tag = params.tag || null;
  const rawPage = parseInt(params.page || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const validSortBy: SortByType[] = ['createdAt', 'viewCount', 'title'];
  const sortBy: SortByType = validSortBy.includes(params.sortBy as SortByType)
    ? (params.sortBy as SortByType)
    : 'createdAt';

  const validOrder: OrderType[] = ['asc', 'desc'];
  const order: OrderType = validOrder.includes(params.order as OrderType)
    ? (params.order as OrderType)
    : 'desc';

  const search = params.search || '';

  const initialData = await api.blogs
    .getList({ tag: tag || undefined, page, sortBy, order, search: search || undefined }, { revalidate: 60 })
    .catch(() => null);

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
          <PostPageContent
            initialData={initialData}
            initialTag={tag}
            initialPage={page}
            initialSortBy={sortBy}
            initialOrder={order}
            initialSearch={search}
          />
        </Suspense>
      </div>

      <WritePostButton />
    </div>
  );
}
