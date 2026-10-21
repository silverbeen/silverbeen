import type { Metadata } from 'next';
import { PostPageContent } from '@/components/post/PostPageContent';
import { WritePostButton } from '@/components/post/WritePostButton';
import { api } from '@/lib/api';
import { config } from '@/config';
import { parseBlogQuery } from '@/utils/blogQuery';

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // URL 쿼리가 단일 소스: 필터/정렬/검색/페이지 변경 시 클라이언트는 URL만 갱신하고 여기서 다시 조회
  const query = parseBlogQuery(await searchParams);

  const [posts, tags] = await Promise.all([
    api.blogs
      .getList(
        {
          tag: query.tag ?? undefined,
          page: query.page,
          sortBy: query.sortBy,
          order: query.order,
          search: query.search || undefined,
        },
        { revalidate: 60 }
      )
      .catch(() => null),
    api.tags.getList().catch(() => []),
  ]);

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

        <PostPageContent posts={posts} tags={tags} query={query} />
      </div>

      <WritePostButton />
    </div>
  );
}
