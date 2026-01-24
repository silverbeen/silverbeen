import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/LogoutButton';

// 빌드 시점에 prerender 방지 - 인증이 필요한 페이지
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/admin/login');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/resume"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow block"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              이력서 관리
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              이력서 내용을 수정하고 관리합니다.
            </p>
          </Link>

          <Link
            href="/admin/portfolio"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow block"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              포트폴리오 관리
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              포트폴리오 내용을 수정하고 관리합니다.
            </p>
          </Link>

          <Link
            href="/admin/posts"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow block"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              블로그 관리
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              블로그 포스트를 작성하고 관리합니다.
            </p>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              설정
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              사이트 설정을 변경합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
