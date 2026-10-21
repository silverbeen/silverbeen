import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '@/config';

const getAccessToken = vi.fn<() => Promise<string | null>>();
vi.mock('@/lib/supabase/client', () => ({ getAccessToken: () => getAccessToken() }));

import { fetcher, ApiError } from './client';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('fetcher', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    getAccessToken.mockReset();
  });

  it('API base URL에 endpoint를 붙여 요청하고 JSON을 파싱한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await expect(fetcher('/posts/1')).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(`${config.apiBaseUrl}/posts/1`, expect.any(Object));
  });

  it('auth 옵션이 없으면 Authorization 헤더를 붙이지 않는다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await fetcher('/tags');

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('auth: true면 세션 토큰을 Bearer 헤더로 첨부한다', async () => {
    getAccessToken.mockResolvedValue('token-123');
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetcher('/posts/admin', { auth: true });

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-123');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('auth: true인데 로그인하지 않았으면 요청 없이 401 ApiError', async () => {
    getAccessToken.mockResolvedValue(null);

    const promise = fetcher('/posts/admin', { auth: true });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('NestJS 에러 응답의 message를 ApiError에 담는다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ statusCode: 409, message: 'Tag already exists' }, { status: 409 }),
    );

    await expect(fetcher('/tags', { method: 'POST' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Tag already exists',
    });
  });

  it('검증 에러(message 배열)는 쉼표로 합친다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: ['title should not be empty', 'seriesId must be a UUID'] }, { status: 400 }),
    );

    await expect(fetcher('/posts')).rejects.toMatchObject({
      status: 400,
      message: 'title should not be empty, seriesId must be a UUID',
    });
  });

  it('JSON이 아닌 에러 응답은 상태 코드로 메시지를 만든다', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' }),
    );

    await expect(fetcher('/posts')).rejects.toMatchObject({
      status: 502,
      message: 'API Error: 502 Bad Gateway',
    });
  });

  it('본문이 없는 응답(204)은 undefined를 반환한다', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(fetcher('/posts/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('revalidate/tags 옵션을 next fetch 옵션으로 전달한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await fetcher('/posts', { revalidate: 60, tags: ['posts'] });

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 60, tags: ['posts'] } });
  });
});
