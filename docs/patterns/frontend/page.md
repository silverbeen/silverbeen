# 페이지 생성 패턴

## 파일 위치
```
apps/web/src/app/{route}/page.tsx           # 페이지
apps/web/src/app/{route}/loading.tsx        # 로딩 UI
apps/web/src/app/{route}/error.tsx          # 에러 UI
apps/web/src/app/{route}/not-found.tsx      # 404 UI
apps/web/src/app/{route}/layout.tsx         # 레이아웃 (선택)
```

## 동적 라우트
```
apps/web/src/app/blog/[id]/page.tsx         # /blog/123
apps/web/src/app/blog/[slug]/page.tsx       # /blog/my-post
```

---

## Server Component 페이지 (기본)

데이터 페칭이 필요한 페이지. SEO에 유리.

```typescript
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    return { title: '잘못된 요청' };
  }

  try {
    const item = await api.items.getById(itemId);
    return {
      title: `${item.title} | Silverbeen`,
      description: item.excerpt || item.content.slice(0, 160),
    };
  } catch {
    return { title: '항목을 찾을 수 없습니다' };
  }
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    notFound();
  }

  let item;
  try {
    item = await api.items.getById(itemId, { revalidate: 60 });
  } catch {
    notFound();
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {item.title}
        </h1>
        {/* 내용 */}
      </div>
    </div>
  );
}
```

---

## Client Component 페이지

사용자 인터랙션이 많은 페이지 (폼, 필터 등).

```typescript
'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/post';

export default function BlogPage() {
  const [tag, setTag] = useState<string | undefined>();
  const { data, loading, error } = usePosts({ tag });

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류가 발생했습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* 필터 */}
        <div className="mb-8">
          <select
            value={tag || ''}
            onChange={(e) => setTag(e.target.value || undefined)}
            className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">전체</option>
            {/* 태그 옵션 */}
          </select>
        </div>

        {/* 목록 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Suspense + 스켈레톤 패턴 (권장)

빠른 로딩 경험을 위해 **Suspense와 스켈레톤 UI를 적극 활용**하세요.

### 페이지에서 Suspense 사용

```typescript
import { Suspense } from 'react';
import { PostListSkeleton } from '@/components/post/PostListSkeleton';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
          블로그
        </h1>

        {/* Suspense로 데이터 페칭 컴포넌트 감싸기 */}
        <Suspense fallback={<PostListSkeleton />}>
          <PostList />
        </Suspense>
      </div>
    </div>
  );
}

// 별도 Server Component로 분리
async function PostList() {
  const data = await api.posts.getList();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 여러 섹션 병렬 로딩

```typescript
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 각 섹션이 독립적으로 로딩됨 */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<RecentPostsSkeleton />}>
        <RecentPostsSection />
      </Suspense>

      <Suspense fallback={<PopularTagsSkeleton />}>
        <PopularTagsSection />
      </Suspense>
    </div>
  );
}
```

---

## 스켈레톤 컴포넌트 패턴

### 기본 스켈레톤 요소

```typescript
// 스켈레톤 기본 클래스
const skeletonBase = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

// 텍스트 스켈레톤
<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

// 원형 스켈레톤
<div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

// 이미지 스켈레톤
<div className="aspect-video w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
```

### 카드 스켈레톤 예시

```typescript
export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
      {/* 커버 이미지 */}
      <div className="mb-4 h-32 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />

      {/* 태그 */}
      <div className="mb-3 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 제목 */}
      <div className="mb-2 h-6 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* 메타 정보 */}
      <div className="flex gap-4">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
```

### 리스트 스켈레톤 예시

```typescript
export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 상세 페이지 스켈레톤 예시

```typescript
export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* 태그 */}
      <div className="mb-4 flex gap-2">
        <div className="h-7 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 제목 */}
      <div className="mb-4 h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-6 h-10 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* 메타 정보 */}
      <div className="mb-8 flex gap-4">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 본문 */}
      <div className="space-y-4">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
```

---

## loading.tsx (Suspense 폴백으로도 사용 가능)

```typescript
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}
```

---

## error.tsx

```typescript
'use client';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        오류가 발생했습니다
      </h2>
      <p className="mb-6 text-gray-500 dark:text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
}
```

---

## not-found.tsx

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        페이지를 찾을 수 없습니다
      </h2>
      <Link
        href="/"
        className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
```

---

## 페이지 레이아웃 패턴

### Sticky 헤더
```typescript
<div className="sticky top-14 z-40 border-b border-gray-200/80 bg-gray-50/95 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/95">
  <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
    {/* 내용 */}
  </div>
</div>
```

### 사이드바 레이아웃
```typescript
<div className="mx-auto max-w-6xl px-6 py-12">
  {/* 사이드바 */}
  <aside className="fixed top-30 right-[max(1rem,calc(50%-38rem))] hidden w-40 xl:block">
    {/* ToC 등 */}
  </aside>

  {/* 메인 콘텐츠 */}
  <main className="max-w-4xl">
    {/* 내용 */}
  </main>
</div>
```

---

## 체크리스트

- [ ] Server vs Client Component 결정
- [ ] generateMetadata로 SEO 처리
- [ ] **Suspense + 스켈레톤 적용 (빠른 로딩)**
- [ ] loading.tsx 추가
- [ ] error.tsx 추가 (필요시)
- [ ] not-found.tsx 추가 (동적 라우트)
- [ ] 반응형 레이아웃
