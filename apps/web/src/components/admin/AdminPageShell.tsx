import Link from 'next/link';
import type { ReactNode } from 'react';

const MAX_WIDTH_CLASS = {
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const;

interface AdminPageShellProps {
  title: ReactNode;
  /** 제목 우측 액션 영역 (버튼 등) */
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  /** loading 중 표시할 스켈레톤 (기본: 제목 + 블록) */
  skeleton?: ReactNode;
  children?: ReactNode;
}

export function AdminSkeleton({
  blocks = 1,
  blockClassName = 'h-48',
}: {
  blocks?: number;
  /** 각 블록 높이 등 (Tailwind 클래스) */
  blockClassName?: string;
}) {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className={`rounded-xl bg-gray-200 dark:bg-gray-700 ${blockClassName}`} />
      ))}
    </div>
  );
}

export function AdminErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20"
    >
      <p className="text-red-600 dark:text-red-400">에러가 발생했습니다: {error.message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

/**
 * 어드민 하위 페이지 공통 레이아웃: 뒤로가기 링크 / 제목 / 액션 / 로딩 / 에러 상태
 */
export function AdminPageShell({
  title,
  actions,
  backHref = '/admin',
  backLabel = '대시보드로 돌아가기',
  maxWidth = '6xl',
  loading = false,
  error = null,
  onRetry,
  skeleton,
  children,
}: AdminPageShellProps) {
  let body: ReactNode = children;
  if (loading) {
    body = skeleton ?? <AdminSkeleton />;
  } else if (error) {
    body = <AdminErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto ${MAX_WIDTH_CLASS[maxWidth]} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ← {backLabel}
            </Link>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {body}
      </div>
    </div>
  );
}
