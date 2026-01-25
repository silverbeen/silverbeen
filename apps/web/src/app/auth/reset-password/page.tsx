'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      // 비밀번호 재설정 링크로 접근하면 세션이 있어야 함
      setIsValidSession(!!session);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // 성공 시 로그인 페이지로 리다이렉트
      router.push('/admin/login?message=password_updated');
    } catch (error) {
      console.error('Password update error:', error);
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              유효하지 않은 링크
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                새 비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
