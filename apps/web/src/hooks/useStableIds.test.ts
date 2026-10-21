import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useStableIds } from './useStableIds';

describe('useStableIds', () => {
  it('항목 수만큼 고유 ID를 만들고 길이 변화에 맞춰 보정한다', () => {
    const { result, rerender } = renderHook(({ count }) => useStableIds(count), {
      initialProps: { count: 2 },
    });
    const [a, b] = result.current.ids;
    expect(new Set(result.current.ids).size).toBe(2);

    rerender({ count: 3 });
    expect(result.current.ids.slice(0, 2)).toEqual([a, b]);
    expect(result.current.ids).toHaveLength(3);
  });

  it('move/remove 후에도 각 항목의 ID가 따라간다', () => {
    const { result, rerender } = renderHook(({ count }) => useStableIds(count), {
      initialProps: { count: 3 },
    });
    const [a, b, c] = result.current.ids;

    act(() => result.current.move(0, 2));
    expect(result.current.ids).toEqual([b, c, a]);

    act(() => result.current.remove(1));
    rerender({ count: 2 });
    expect(result.current.ids).toEqual([b, a]);
  });
});
