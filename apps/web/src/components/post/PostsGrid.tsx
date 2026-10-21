import { PostCard } from './PostCard';
import type { PostListResponse } from '@silverbeen/types';

interface PostsGridProps {
  /** null이면 조회 실패 */
  data: PostListResponse | null;
  tag?: string | null;
  search?: string;
}

export function PostsGrid({ data, tag, search }: PostsGridProps) {
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
          {search
            ? `"${search}" 검색 결과가 없습니다.`
            : tag
              ? `"${tag}" 태그의 글이 없습니다.`
              : '아직 작성된 글이 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {data.posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
