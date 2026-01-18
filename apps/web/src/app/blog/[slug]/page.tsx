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
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await api.posts.getBySlug(slug);
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await api.posts.getBySlug(slug, { revalidate: 60 });
  } catch {
    notFound();
  }

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← 블로그 목록으로
        </Link>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.name}`}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 inline-flex rounded px-2 py-1 text-sm transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <time dateTime={post.createdAt} className="text-gray-500 dark:text-gray-400">
              {formatDate(post.createdAt)}
            </time>
            <ViewCounter slug={post.slug} initialCount={post.viewCount} />
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert mb-12 max-w-none">
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

        <hr className="mb-8 border-gray-200 dark:border-gray-700" />

        <section>
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">댓글</h2>
          <GiscusComments slug={post.slug} />
        </section>
      </article>
    </div>
  );
}
