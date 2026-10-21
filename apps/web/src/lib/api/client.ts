import { config } from '@/config';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FetcherOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
  /** true면 현재 Supabase 세션의 access token을 Authorization 헤더로 첨부 (브라우저 전용) */
  auth?: boolean;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  // 서버 번들에 브라우저 클라이언트가 섞이지 않도록 지연 로드
  const { getAccessToken } = await import('@/lib/supabase/client');
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(401, '로그인이 필요합니다.');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * NestJS 에러 응답({ message: string | string[] })에서 메시지 추출
 */
async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
  } catch {
    // JSON이 아닌 응답
  }
  return `API Error: ${response.status} ${response.statusText}`;
}

export async function fetcher<T>(endpoint: string, options?: FetcherOptions): Promise<T> {
  const { revalidate, tags, auth, ...fetchOptions } = options || {};

  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? await getAuthHeader() : {}),
      ...fetchOptions?.headers,
    },
    next: revalidate !== undefined || tags ? { revalidate, tags } : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  // 204 No Content 등 body가 없는 응답
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
