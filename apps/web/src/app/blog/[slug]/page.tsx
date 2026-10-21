import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import { api, ApiError } from '@/lib/api';
import { config } from '@/config';
import { GiscusComments } from '@/components/post/GiscusComments';
import { TableOfContents } from '@/components/post/TableOfContents';
import { BlogPostHeader } from '@/components/post/BlogPostHeader';
import { ViewCounter } from '@/components/post/ViewCounter';
import { PostNavigation } from '@/components/post/PostNavigation';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import { WritePostButton } from '@/components/post/WritePostButton';
import { CodeBlockCopy } from '@/components/post/CodeBlockCopy';
import { LikeButton } from '@/components/post/LikeButton';
import { SeriesNavigation } from '@/components/post/SeriesNavigation';
import { formatDateKorean } from '@/utils/date';
import { getReadingTime } from '@/utils/post';
import type { Metadata } from 'next';
import type { Post } from '@silverbeen/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 공개(발행된) 글 조회. generateMetadata와 페이지에서 같은 요청을 공유하도록 cache로 중복 제거.
 * 존재하지 않거나 비공개(draft)인 글은 null (백엔드가 draft에 404 반환)
 */
const getPublishedPost = cache(async (slug: string): Promise<Post | null> => {
  try {
    const post = await api.blogs.getBySlug(slug, { revalidate: 60 });
    return post.published ? post : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let blog: Post | null;
  try {
    blog = await getPublishedPost(slug);
  } catch {
    // 일시적인 API 오류: 기본 메타데이터로 대체 (본문 렌더링에서 에러 처리)
    return { title: '블로그' };
  }

  if (!blog) {
    notFound();
  }

  const description = blog.excerpt || blog.content.slice(0, 160).replace(/\n/g, ' ');
  const url = `${config.siteUrl}/blog/${blog.slug}`;

  return {
    title: blog.title,
    description,
    openGraph: {
      title: blog.title,
      description,
      url,
      type: 'article',
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [config.author.name],
      tags: blog.tags.map((tag) => tag.name),
      images: blog.coverImage
        ? [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

function BlogJsonLd({ blog }: { blog: Post }) {
  const url = `${config.siteUrl}/blog/${blog.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || blog.content.slice(0, 160).replace(/\n/g, ' '),
    image: blog.coverImage || undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    url,
    author: {
      '@type': 'Person',
      name: config.author.name,
      email: config.author.email,
      url: config.author.url,
    },
    publisher: {
      '@type': 'Person',
      name: config.author.name,
      url: config.siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: blog.tags.map((tag) => tag.name).join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: config.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '블로그',
        item: `${config.siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: url,
      },
    ],
  };

  const safeArticleJson = JSON.stringify(articleSchema).replace(/</g, '\\u003c');
  const safeBreadcrumbJson = JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeArticleJson }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeBreadcrumbJson }}
      />
    </>
  );
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;

  const blog = await getPublishedPost(slug);
  if (!blog) {
    notFound();
  }

  // 이전/다음 글은 부가 정보이므로 실패해도 본문은 렌더링
  const adjacentPosts = await api.blogs
    .getAdjacent(blog.id, { revalidate: 60 })
    .catch(() => null);

  const readingTime = getReadingTime(blog.content);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <BlogJsonLd blog={blog} />
      {/* Sticky Title Header with Mobile ToC */}
      <BlogPostHeader postId={blog.id} postTitle={blog.title} />

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Floating ToC - Right Side */}
        <aside className="fixed top-40 right-[max(1rem,calc(50%-38rem))] z-30 hidden w-40 xl:block">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>
        <article>
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                  className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 inline-flex rounded-full px-3 py-1 text-sm font-medium transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            <h1 className="mb-4 text-3xl leading-tight font-bold text-gray-900 md:text-4xl dark:text-white">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={blog.createdAt} className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDateKorean(blog.createdAt)}
              </time>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {readingTime}분 읽기
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <ViewCounter slug={blog.slug} initialCount={blog.viewCount} />
            </div>
          </header>

          {blog.coverImage && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {blog.series && (
            <SeriesNavigation series={blog.series} currentPostId={blog.id} />
          )}

          <div className="prose prose-lg dark:prose-invert mb-12 max-w-none">
            <CodeBlockCopy />
            <MDXRemote
              source={blog.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
                  ],
                },
              }}
            />
          </div>

          <div className="mb-8 flex justify-center">
            <LikeButton slug={blog.slug} initialLikeCount={blog.likeCount} />
          </div>

          <hr className="mb-8 border-gray-200 dark:border-gray-700" />

          {adjacentPosts && <PostNavigation adjacentPosts={adjacentPosts} />}

          <section>
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">댓글</h2>
            <GiscusComments slug={blog.slug} />
          </section>
        </article>
      </div>

      <WritePostButton />
      <ScrollToTopButton />
    </div>
  );
}
