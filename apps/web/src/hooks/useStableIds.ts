'use client';

import { useCallback, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { createId } from '@/utils/ids';

function createIds(count: number): string[] {
  return Array.from({ length: count }, createId);
}

/**
 * 문자열 배열처럼 ID를 담을 수 없는 리스트용 안정적인 key 목록.
 * 리스트 내부에서 일어난 이동/삭제는 move/remove로 함께 반영하고,
 * 외부에서 길이가 바뀌면 (추가/일괄 교체) 끝에서부터 보정한다.
 */
export function useStableIds(count: number) {
  const [ids, setIds] = useState(() => createIds(count));

  let current = ids;
  if (ids.length !== count) {
    current = count > ids.length ? [...ids, ...createIds(count - ids.length)] : ids.slice(0, count);
    // 렌더 중 상태 보정 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
    setIds(current);
  }

  const move = useCallback((from: number, to: number) => {
    setIds((prev) => arrayMove(prev, from, to));
  }, []);

  const remove = useCallback((index: number) => {
    setIds((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { ids: current, move, remove };
}
