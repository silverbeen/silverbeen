import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import { api } from '@/lib/api';
import { GiscusComments } from '@/components/post/GiscusComments';
import { TableOfContents } from '@/components/post/TableOfContents';
import { BlogPostHeader } from '@/components/post/BlogPostHeader';
import { ViewCounter } from '@/components/post/ViewCounter';
import { PostNavigation } from '@/components/post/PostNavigation';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import { WritePostButton } from '@/components/post/WritePostButton';
import { CodeBlockCopy } from '@/components/post/CodeBlockCopy';
import { formatDateKorean } from '@/utils/date';
import { getReadingTime } from '@/utils/post';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const blogId = parseInt(id, 10);

  if (isNaN(blogId)) {
    return { title: '잘못된 요청' };
  }

  try {
    const blog = await api.blogs.getById(blogId);
    return {
      title: `${blog.title} | Silverbeen Blog`,
      description: blog.excerpt || blog.content.slice(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.excerpt || blog.content.slice(0, 160),
        images: blog.coverImage ? [{ url: blog.coverImage }] : undefined,
      },
    };
  } catch {
    return {
      title: '글을 찾을 수 없습니다',
    };
  }
}

export default async function BlogPage({ params }: PageProps) {
  const { id } = await params;
  const blogId = parseInt(id, 10);

  if (isNaN(blogId)) {
    notFound();
  }

  let blog;
  let adjacentPosts;
  try {
    [blog, adjacentPosts] = await Promise.all([
      api.blogs.getById(blogId, { revalidate: 60 }),
      api.blogs.getAdjacent(blogId, { revalidate: 60 }),
    ]);
  } catch {
    notFound();
  }

  if (!blog || !blog.published) {
    notFound();
  }

  const readingTime = getReadingTime(blog.content);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Title Header with Mobile ToC */}
      <BlogPostHeader postId={blog.id} postTitle={blog.title} />

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Floating ToC - Right Side */}
        <aside className="fixed top-40 right-[max(1rem,calc(50%-38rem))] z-30 hidden w-40 xl:block">
          <div className="sticky top-24">
            <TableOfContents content={blog.content} />
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
              <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
            </div>
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

          <hr className="mb-8 border-gray-200 dark:border-gray-700" />

          <PostNavigation adjacentPosts={adjacentPosts} />

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
