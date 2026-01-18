'use client';

import Link from 'next/link';
import { PostActions } from '@/components/post/PostActions';
import { MobileTocButton, MobileTocPanel, useMobileToc } from '@/components/post/MobileToc';

interface BlogPostHeaderProps {
  postId: number;
  postTitle: string;
}

export function BlogPostHeader({ postId, postTitle }: BlogPostHeaderProps) {
  const { isOpen, toggle, close, hasHeadings } = useMobileToc();

  return (
    <div className="sticky top-14 z-40">
      <div className="border-b border-gray-200/80 bg-gray-50/95 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href="/blog"
              className="hover:text-primary-500 dark:hover:text-primary-400 flex-shrink-0 text-gray-400 transition-colors dark:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {postTitle}
            </h1>
            <MobileTocButton isOpen={isOpen} onClick={toggle} hasHeadings={hasHeadings} />
          </div>
          <PostActions postId={postId} postTitle={postTitle} />
        </div>
      </div>
      <MobileTocPanel isOpen={isOpen} onClose={close} />
    </div>
  );
}
