'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * 클라이언트 하이드레이션 이후 true. (테마 아이콘 등 서버/클라이언트 결과가 다른 UI에 사용)
 * useEffect(() => setMounted(true)) 패턴 대체
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
