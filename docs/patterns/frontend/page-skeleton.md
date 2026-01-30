# 스켈레톤 UI 패턴

빠른 로딩 경험을 위해 **Suspense와 스켈레톤 UI를 적극 활용**하세요.

## 페이지에서 Suspense 사용

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

## 여러 섹션 병렬 로딩

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

## 스켈레톤 컴포넌트

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

### 카드 스켈레톤

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

### 리스트 스켈레톤

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

### 상세 페이지 스켈레톤

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
