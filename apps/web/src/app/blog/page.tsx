import { Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BlogCard } from '@/components/blog/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블로그 | Silverbeen',
  description: '개발 관련 글과 경험을 공유합니다.',
};

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

async function fetchPosts(tag?: string, page?: number) {
  try {
    return await api.posts.getList({ tag, page, limit: 12 });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return null;
  }
}

async function BlogContent({ tag, page }: { tag?: string; page?: number }) {
  const data = await fetchPosts(tag, page);

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 dark:text-red-400">글을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (data.posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {tag ? `"${tag}" 태그의 글이 없습니다.` : '아직 작성된 글이 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-2">
          {data.page > 1 && (
            <Link
              href={`/blog?page=${data.page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/blog?page=${pageNum}${tag ? `&tag=${tag}` : ''}`}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                pageNum === data.page
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500'
              }`}
            >
              {pageNum}
            </Link>
          ))}
          {data.page < data.totalPages && (
            <Link
              href={`/blog?page=${data.page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </>
  );
}

async function fetchTags() {
  try {
    return await api.tags.getList();
  } catch {
    return null;
  }
}

async function TagList({ currentTag }: { currentTag?: string }) {
  const tags = await fetchTags();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          !currentTag
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
        }`}
      >
        전체
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.name}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            currentTag === tag.name
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:text-primary-500'
          }`}
        >
          {tag.name}
          {tag._count && <span className="ml-1.5 text-xs opacity-70">({tag._count.posts})</span>}
        </Link>
      ))}
    </div>
  );
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tag = params.tag;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="mb-3 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Blog
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            개발 관련 글과 경험을 공유합니다.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mb-8 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          }
        >
          <TagList currentTag={tag} />
        </Suspense>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="h-32 animate-pulse bg-linear-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="h-5 w-4/5 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                      <div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                      <div className="h-3 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <BlogContent tag={tag} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
