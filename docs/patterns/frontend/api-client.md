# API 클라이언트 패턴

## 파일 위치
```
apps/web/src/lib/api/{entity}.ts
apps/web/src/lib/api/client.ts   # fetcher 함수
apps/web/src/lib/api/index.ts    # barrel export
```

---

## fetcher 함수 (client.ts)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetcherOptions extends RequestInit {
  revalidate?: number;
}

export async function fetcher<T>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { revalidate, ...init } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## Entity API 템플릿

```typescript
import { fetcher } from './client';
import type {
  Entity,
  EntityListResponse,
  CreateEntityDto,
  UpdateEntityDto,
} from '@/types/entity';

export const entityApi = {
  // 목록 조회 (페이지네이션, 필터링)
  getList: (params?: {
    page?: number;
    limit?: number;
    tag?: string;
    sortBy?: 'createdAt' | 'viewCount' | 'title';
    order?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    return fetcher<EntityListResponse>(`/entities${query ? `?${query}` : ''}`);
  },

  // Slug로 조회
  getBySlug: (slug: string, options?: { revalidate?: number }) =>
    fetcher<Entity>(`/entities/${slug}`, { revalidate: options?.revalidate }),

  // ID로 조회
  getById: (id: number, options?: { revalidate?: number }) =>
    fetcher<Entity>(`/entities/${id}`, { revalidate: options?.revalidate }),

  // 관리자 목록 조회 (인증 필요)
  getAdminList: (token: string) =>
    fetcher<Entity[]>('/entities/admin', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // 생성 (인증 필요)
  create: (data: CreateEntityDto, token: string) =>
    fetcher<Entity>('/entities', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // 수정 (인증 필요)
  update: (id: number, data: UpdateEntityDto, token: string) =>
    fetcher<Entity>(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // 삭제 (인증 필요)
  delete: (id: number, token: string) =>
    fetcher<void>(`/entities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // 특수 액션 (예: 조회수 증가)
  incrementView: (slug: string) =>
    fetcher<Entity>(`/entities/${slug}/view`, { method: 'POST' }),

  // 관계 데이터 조회 (예: 이전/다음 항목)
  getAdjacent: (id: number, options?: { revalidate?: number }) =>
    fetcher<AdjacentResponse>(`/entities/${id}/adjacent`, {
      revalidate: options?.revalidate,
    }),
};
```

---

## barrel export (index.ts)

```typescript
export { fetcher } from './client';
export { postsApi } from './posts';
export { tagsApi } from './tags';
export { resumeApi } from './resume';

// 통합 API 객체
export const api = {
  posts: postsApi,
  blogs: postsApi,  // 별칭
  tags: tagsApi,
  resume: resumeApi,
};
```

---

## 인증 헤더 패턴

```typescript
// 인증이 필요한 요청
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  throw new Error('Not authenticated');
}
const result = await api.entities.create(data, session.access_token);

// API 함수에서 헤더 설정
headers: { Authorization: `Bearer ${token}` }
```

---

## URLSearchParams 사용 패턴

```typescript
const searchParams = new URLSearchParams();

// 조건부 파라미터 추가
if (params?.page) searchParams.set('page', params.page.toString());
if (params?.limit) searchParams.set('limit', params.limit.toString());
if (params?.tag) searchParams.set('tag', params.tag);

// 쿼리 스트링 생성
const query = searchParams.toString();
const url = `/endpoint${query ? `?${query}` : ''}`;
```

---

## 에러 응답 타입

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// fetcher에서 에러 처리
if (!response.ok) {
  const error: ApiError = await response.json();
  throw new Error(Array.isArray(error.message) ? error.message[0] : error.message);
}
```

## 타임아웃 처리

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeout);
```

## 체크리스트

- [ ] fetcher 함수 사용
- [ ] 타입 정의 import
- [ ] CRUD 메서드 구현
- [ ] 인증 필요 메서드에 token 파라미터
- [ ] barrel export 추가 (index.ts)
- [ ] api 객체에 등록
- [ ] 에러 응답 파싱
