import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAdminResource } from './useAdminResource';

describe('useAdminResource', () => {
  it('로드 결과를 data에 담고 loading을 해제한다', async () => {
    const load = vi.fn().mockResolvedValue(['a']);
    const { result } = renderHook(() => useAdminResource(load, [] as string[]));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['a']);
    expect(result.current.error).toBeNull();
  });

  it('실패하면 error를 설정하고 reload로 복구한다', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(1);
    const { result } = renderHook(() => useAdminResource(load, 0));

    await waitFor(() => expect(result.current.error?.message).toBe('boom'));

    await act(() => result.current.reload());
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe(1);
  });

  it('늦게 도착한 이전 요청의 응답은 무시한다', async () => {
    let resolveFirst!: (v: string) => void;
    const first = new Promise<string>((r) => (resolveFirst = r));
    const load = vi.fn().mockReturnValueOnce(first).mockResolvedValueOnce('second');
    const { result } = renderHook(() => useAdminResource(load, ''));

    await act(() => result.current.reload());
    expect(result.current.data).toBe('second');

    await act(async () => resolveFirst('first'));
    expect(result.current.data).toBe('second');
  });
});
