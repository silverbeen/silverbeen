import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PasswordChangeForm } from './PasswordChangeForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // 접근 제어는 미들웨어에서 처리. 여기서는 이메일 표시/재인증용으로만 유저를 조회
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              aria-label="대시보드로 돌아가기"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">설정</h1>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">비밀번호 변경</h2>

          <PasswordChangeForm email={user.email} />

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              비밀번호를 잊으셨나요?{' '}
              <Link href="/admin/login" className="text-primary-500 hover:text-primary-600">
                로그인 페이지에서 재설정
              </Link>
              할 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
