import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 유효한 사용자 세션이 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/admin/login?error=invalid_reset_link');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              새 비밀번호 설정
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              새로운 비밀번호를 입력해주세요
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
