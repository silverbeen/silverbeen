'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, User as UserIcon, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useToast, useConfirm } from '@/components/ui';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import type { User } from '@/types/user';

export default function AdminUsersPage() {
  const { users, loading, error, currentUserId, updateRole, deleteUser } = useAdminUsers();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRoleChange = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const message =
      newRole === 'ADMIN'
        ? `"${user.email}"에게 관리자 권한을 부여하시겠습니까?`
        : `"${user.email}"의 관리자 권한을 해제하시겠습니까?`;

    const confirmed = await confirm({
      title: '권한 변경',
      message,
      confirmText: '변경',
      cancelText: '취소',
    });

    if (!confirmed) return;

    setActionLoading(user.id);
    try {
      await updateRole(user.id, newRole);
      toast(`권한이 ${newRole === 'ADMIN' ? '관리자' : '일반'}로 변경되었습니다.`, 'success');
    } catch (err) {
      toast('권한 변경에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      toast('자기 자신은 삭제할 수 없습니다.', 'error');
      return;
    }

    const confirmed = await confirm({
      title: '유저 삭제',
      message: `"${user.email}" 유저를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });

    if (!confirmed) return;

    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      toast('유저가 삭제되었습니다.', 'success');
    } catch (err) {
      toast('유저 삭제에 실패했습니다.', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
          <div className="text-red-500 dark:text-red-400">에러가 발생했습니다: {error.message}</div>
        </div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const userCount = users.filter((u) => u.role === 'USER').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">유저 관리</h1>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">전체 유저</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">관리자</p>
            <p className="text-2xl font-bold text-primary-500">{adminCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">일반 유저</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userCount}</p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">아직 등록된 유저가 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    유저
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    마지막 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-primary-100 dark:bg-primary-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-4 h-4 text-primary-500" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || '이름 없음'}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-primary-500">(나)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {user.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(user.lastSignInAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(user)}
                          disabled={actionLoading === user.id || user.id === currentUserId}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.role === 'ADMIN' ? '일반으로 변경' : '관리자로 변경'}
                        >
                          {user.role === 'ADMIN' ? (
                            <ShieldOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-primary-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading === user.id || user.id === currentUserId}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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
