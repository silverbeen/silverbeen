import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { getNextIndex, getPrevIndex, useImageGallery } from './useImageGallery';

describe('getPrevIndex / getNextIndex', () => {
  it('양 끝에서 순환한다', () => {
    expect(getPrevIndex(0, 3)).toBe(2);
    expect(getPrevIndex(2, 3)).toBe(1);
    expect(getNextIndex(2, 3)).toBe(0);
    expect(getNextIndex(0, 3)).toBe(1);
  });

  it('빈 목록이면 0', () => {
    expect(getPrevIndex(0, 0)).toBe(0);
    expect(getNextIndex(0, 0)).toBe(0);
  });
});

describe('useImageGallery', () => {
  it('열기/이동/닫기', () => {
    const { result } = renderHook(() => useImageGallery(3));
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open(2));
    expect(result.current).toMatchObject({ isOpen: true, currentIndex: 2 });

    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(2);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('이미지가 줄어들면 인덱스를 범위 안으로 보정한다', () => {
    const { result, rerender } = renderHook(({ length }) => useImageGallery(length), {
      initialProps: { length: 3 },
    });
    act(() => result.current.open(2));
    rerender({ length: 1 });
    expect(result.current.currentIndex).toBe(0);
  });
});
