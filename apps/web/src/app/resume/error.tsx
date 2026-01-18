"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResumeError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Resume page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-red-500">오류</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          이력서를 불러오는 중 문제가 발생했습니다
        </h2>
        <p className="mb-8 text-muted-foreground">
          일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
