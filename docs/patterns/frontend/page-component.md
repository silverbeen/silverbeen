# 페이지 컴포넌트 패턴

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
