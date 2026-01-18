import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { api } from '@/lib/api';
import { GiscusComments } from '@/components/blog/GiscusComments';
import { ViewCounter } from '@/components/blog/ViewCounter';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return { title: '잘못된 요청' };
  }

  try {
    const post = await api.posts.getById(postId);
    return {
      title: `${post.title} | Silverbeen Blog`,
      description: post.excerpt || post.content.slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.excerpt || post.content.slice(0, 160),
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      },
    };
  } catch {
    return {
      title: '글을 찾을 수 없습니다',
    };
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  let post;
  try {
    post = await api.posts.getById(postId, { revalidate: 60 });
  } catch {
    notFound();
  }

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-8 inline-block"
        >
          &larr; 블로그 목록으로
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.name}`}
                className="inline-flex px-2 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <time
              dateTime={post.createdAt}
              className="text-gray-500 dark:text-gray-400"
            >
              {formatDate(post.createdAt)}
            </time>
            <ViewCounter slug={post.slug} initialCount={post.viewCount} />
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                rehypePlugins: [
                  rehypeHighlight,
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    { behavior: 'wrap', properties: { className: ['anchor'] } },
                  ],
                ],
              },
            }}
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-8" />

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            댓글
          </h2>
          <GiscusComments slug={post.slug} />
        </section>
      </article>
    </div>
  );
}
