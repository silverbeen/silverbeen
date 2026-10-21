'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PasswordChangeFormProps {
  email: string;
}

export function PasswordChangeForm({ email }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 유효성 검사
    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // 현재 비밀번호로 재인증
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setError('현재 비밀번호가 올바르지 않습니다.');
        return;
      }

      // 새 비밀번호로 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="currentPassword"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          현재 비밀번호
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="현재 비밀번호를 입력하세요"
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          새 비밀번호
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="최소 6자 이상"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          새 비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="새 비밀번호를 다시 입력하세요"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 focus:ring-primary-500 w-full rounded-lg px-4 py-3 font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        {isLoading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  );
}
