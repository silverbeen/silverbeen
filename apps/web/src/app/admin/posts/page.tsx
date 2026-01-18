'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminPosts } from '@/hooks/usePosts';
import type { Post } from '@/types/post';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AdminPostsPage() {
  const { posts, loading, error, deletePost } = useAdminPosts();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (post: Post) => {
    if (!confirm(`"${post.title}" 글을 삭제하시겠습니까?`)) return;

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-500 dark:text-red-400">
            에러가 발생했습니다: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/admin"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
            >
              ← 대시보드로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              블로그 글 관리
            </h1>
          </div>
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            새 글 작성
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              아직 작성된 글이 없습니다.
            </p>
            <Link
              href="/admin/posts/new"
              className="text-primary-500 hover:text-primary-600"
            >
              첫 번째 글을 작성해보세요 →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    태그
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {post.published ? '발행됨' : '임시저장'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {post.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-primary-500 hover:text-primary-600 text-sm"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
                      >
                        {deletingId === post.id ? '삭제 중...' : '삭제'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
