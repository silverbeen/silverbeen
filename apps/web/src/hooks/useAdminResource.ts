'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toError } from '@/utils/error';

export interface AdminResource<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  /** 최초 로딩 중 여부 (reload 시에는 기존 데이터를 유지하므로 false) */
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * 어드민 페이지 공통 데이터 로딩 훅 (load / loading / error / reload)
 * - `load`는 안정적인 참조여야 함 (모듈 함수 또는 useCallback)
 * - 늦게 도착한 이전 요청의 응답은 무시
 */
export function useAdminResource<T>(load: () => Promise<T>, initialData: T): AdminResource<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const result = await load();
      if (requestId !== requestIdRef.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(toError(err));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
