'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/resume');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          접근 권한이 없습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          관리자만 접근할 수 있는 페이지입니다.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {countdown}초 후 이동합니다...
        </p>
        <button
          onClick={() => router.push('/resume')}
          className="mt-4 px-4 py-2 text-sm text-primary-500 hover:text-primary-600 underline"
        >
          지금 이동하기
        </button>
      </div>
    </div>
  );
}
