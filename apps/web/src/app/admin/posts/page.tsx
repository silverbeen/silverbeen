'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, FileText, CheckCircle, Clock, Eye, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useAdminPosts } from '@/hooks/usePosts';
import { useToast, useConfirm } from '@/components/ui';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { formatDate } from '@/utils/date';
import type { Post } from '@silverbeen/types';

export default function AdminPostsPage() {
  const { posts, loading, error, refetch, deletePost } = useAdminPosts();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (post: Post) => {
    const confirmed = await confirm({
      title: '글 삭제',
      message: `"${post.title}" 글을 삭제하시겠습니까? 삭제된 글은 복구할 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      toast('글이 삭제되었습니다.', 'success');
    } catch (err) {
      toast('삭제에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const publishedPosts = posts.filter((p) => p.published);
  const draftPosts = posts.filter((p) => !p.published);
  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);

  const stats = [
    {
      label: '전체 게시글',
      value: posts.length,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: '발행됨',
      value: publishedPosts.length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: '임시저장',
      value: draftPosts.length,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: '총 조회수',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
  ];

  return (
    <AdminPageShell
      title={
        <>
          블로그 글 관리
          {!loading && (
            <span className="text-sm font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {posts.length}
            </span>
          )}
        </>
      }
      actions={
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 글 작성
        </Link>
      }
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            아직 작성된 글이 없습니다.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600"
          >
            <Plus className="w-4 h-4" />
            첫 번째 글을 작성해보세요
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  태그
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
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
                    <div className="flex items-center gap-3">
                      {post.coverImage && (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 transition-colors truncate"
                          >
                            {post.title}
                          </Link>
                          {post.published && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
                              title="새 탭에서 보기"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex min-w-16 justify-center px-2 py-1 text-xs font-semibold rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {post.published ? '발행됨' : '임시저장'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Eye className="w-4 h-4" />
                      {post.viewCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-500 transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}
