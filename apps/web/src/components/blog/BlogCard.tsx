import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types/blog';

interface BlogCardProps {
  post: Post;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function getPreview(content: string, maxLength: number = 120): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/>\s/g, '')
    .replace(/-\s/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}

export function BlogCard({ post }: BlogCardProps) {
  const preview = post.excerpt || getPreview(post.content);
  const readingTime = getReadingTime(post.content);

  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative flex flex-col bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 dark:hover:shadow-primary-500/10"
    >
      {/* Cover Image or Gradient */}
      {post.coverImage ? (
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="relative h-32 bg-linear-to-br from-primary-400 via-primary-500 to-primary-600 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id={`pattern-${post.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-white/40" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill={`url(#pattern-${post.id})`} />
            </svg>
          </div>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{readingTime}분 읽기</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex px-2.5 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full"
              >
                {tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex px-2.5 py-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200">
          {post.title}
        </h2>

        {/* Preview */}
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {preview}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <time dateTime={post.createdAt} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.createdAt)}
            </time>
            {post.coverImage && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime}분
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.viewCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
}
