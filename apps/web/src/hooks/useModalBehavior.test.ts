import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { lockBodyScroll, useModalBehavior } from './useModalBehavior';

afterEach(() => {
  document.body.style.overflow = '';
});

describe('lockBodyScroll', () => {
  it('마지막 잠금이 해제될 때만 원래 overflow로 복원한다', () => {
    document.body.style.overflow = 'auto';

    const releaseOuter = lockBodyScroll();
    const releaseInner = lockBodyScroll();
    expect(document.body.style.overflow).toBe('hidden');

    releaseInner();
    expect(document.body.style.overflow).toBe('hidden');

    // 중복 해제는 무시
    releaseInner();
    expect(document.body.style.overflow).toBe('hidden');

    releaseOuter();
    expect(document.body.style.overflow).toBe('auto');
  });
});

describe('useModalBehavior', () => {
  it('중첩 모달에서는 가장 위의 모달만 키 입력을 처리한다', () => {
    const outer = vi.fn();
    const inner = vi.fn();

    const outerHook = renderHook(({ open }) => useModalBehavior(open, { onKeyDown: outer }), {
      initialProps: { open: true },
    });
    const innerHook = renderHook(({ open }) => useModalBehavior(open, { onKeyDown: inner }), {
      initialProps: { open: true },
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');

    // 안쪽 모달을 닫아도 바깥 모달의 스크롤 잠금은 유지
    innerHook.rerender({ open: false });
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(outer).toHaveBeenCalledTimes(1);

    outerHook.unmount();
    innerHook.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('닫혀 있으면 아무것도 하지 않는다', () => {
    const handler = vi.fn();
    renderHook(() => useModalBehavior(false, { onKeyDown: handler }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('');
  });
});
