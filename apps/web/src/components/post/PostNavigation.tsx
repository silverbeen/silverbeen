import Link from 'next/link';
import type { AdjacentPostsResponse } from '@/types/post';

interface PostNavigationProps {
  adjacentPosts: AdjacentPostsResponse;
}

export function PostNavigation({ adjacentPosts }: PostNavigationProps) {
  const { prevPost, nextPost } = adjacentPosts;

  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500/50"
        >
          <span className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전 글
          </span>
          <span className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white dark:group-hover:text-primary-400">
            {prevPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {nextPost ? (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="group flex flex-col items-end rounded-xl border border-gray-200 bg-white p-4 text-right transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500/50"
        >
          <span className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            다음 글
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white dark:group-hover:text-primary-400">
            {nextPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
