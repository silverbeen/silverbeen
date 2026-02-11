'use client';

interface DraftBannerProps {
  savedAt: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftBanner({ savedAt, onRestore, onDiscard }: DraftBannerProps) {
  const timeStr = new Date(savedAt).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
      <p className="text-sm text-amber-700 dark:text-amber-400">
        임시 저장된 글이 있습니다. ({timeStr})
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRestore}
          className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
        >
          복원
        </button>
        <button
          onClick={onDiscard}
          className="rounded-md border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
