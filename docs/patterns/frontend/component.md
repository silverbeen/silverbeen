# 컴포넌트 생성 패턴

## 파일 위치
```
apps/web/src/components/{도메인}/{ComponentName}.tsx
apps/web/src/components/{도메인}/index.ts  # barrel export
```

## 기본 템플릿

```typescript
'use client';

import type { EntityType } from '@/types/entity';

interface ComponentNameProps {
  item: EntityType;
  onAction?: () => void;
}

export function ComponentName({ item, onAction }: ComponentNameProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* 내용 */}
    </div>
  );
}
```

## barrel export (index.ts)

```typescript
export { ComponentName } from './ComponentName';
export { AnotherComponent } from './AnotherComponent';
```

## 스타일링 규칙

### Primary 색상
```typescript
// 배경
className="bg-primary-500 hover:bg-primary-600"
// 텍스트
className="text-primary-500 dark:text-primary-400"
// 배지/태그
className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
```

### 다크모드 패턴
```typescript
// 배경
className="bg-white dark:bg-gray-800"
// 텍스트
className="text-gray-900 dark:text-white"
className="text-gray-500 dark:text-gray-400"
// 테두리
className="border-gray-200 dark:border-gray-700"
// 호버
className="hover:bg-gray-50 dark:hover:bg-gray-700"
```

### 레이아웃
```typescript
// 그리드
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
// Flex 정렬
className="flex items-center justify-between gap-3"
// 스페이싱
className="space-y-6 p-6"
// 카드
className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
```

## 카드 컴포넌트 예시 (PostCard 참조)

```typescript
'use client';

import Link from 'next/link';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-primary-200 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-primary-500/30"
    >
      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* 제목 */}
      <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white dark:group-hover:text-primary-400">
        {post.title}
      </h2>

      {/* 메타 정보 */}
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        <span>{post.viewCount.toLocaleString()} 조회</span>
      </div>
    </Link>
  );
}
```

## 체크리스트

- [ ] Props 인터페이스 정의
- [ ] 'use client' 필요 여부 확인 (이벤트 핸들러, 훅 사용 시 필요)
- [ ] barrel export 추가 (index.ts)
- [ ] 다크모드 지원
- [ ] 반응형 디자인 (md:, lg: 브레이크포인트)
