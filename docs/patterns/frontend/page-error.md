# 에러/로딩 처리 패턴

## loading.tsx

```typescript
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}
```

---

## error.tsx

```typescript
'use client';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        오류가 발생했습니다
      </h2>
      <p className="mb-6 text-gray-500 dark:text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
}
```

---

## not-found.tsx

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        페이지를 찾을 수 없습니다
      </h2>
      <Link
        href="/"
        className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
```
