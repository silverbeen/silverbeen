# 폼 컴포넌트 패턴

## 파일 위치
```
apps/web/src/components/{도메인}/{Entity}Editor.tsx
```

---

## 기본 폼 템플릿

```typescript
'use client';

import { useState } from 'react';
import type { CreateEntityDto, Entity } from '@/types/entity';

interface EntityEditorProps {
  initialData?: Entity;
  onSave: (data: CreateEntityDto) => Promise<void>;
  saving?: boolean;
}

export function EntityEditor({ initialData, onSave, saving }: EntityEditorProps) {
  // 상태 초기화 (initialData 사용)
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [published, setPublished] = useState(initialData?.published || false);

  // 검증 및 저장
  const handleSave = async (shouldPublish: boolean) => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const data: CreateEntityDto = {
      title: title.trim(),
      content,
      published: shouldPublish,
    };

    await onSave(data);
  };

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={10}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 발행 체크박스 */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            바로 발행하기
          </span>
        </label>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {saving ? '저장 중...' : '임시저장'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '발행하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 폼 사용 예시 (페이지에서)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminPosts } from '@/hooks/usePosts';
import { PostEditor } from '@/components/post';
import type { CreatePostDto } from '@/types/post';

export default function NewPostPage() {
  const router = useRouter();
  const { createPost } = useAdminPosts();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: CreatePostDto) => {
    try {
      setSaving(true);
      const newPost = await createPost(data);
      router.push(`/admin/posts/${newPost.id}/edit`);
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        새 글 작성
      </h1>
      <PostEditor onSave={handleSave} saving={saving} />
    </div>
  );
}
```

---

## 수정 페이지 패턴

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminPosts, usePost } from '@/hooks/usePosts';
import { PostEditor } from '@/components/post';
import type { CreatePostDto } from '@/types/post';

interface EditPostPageProps {
  params: { id: string };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const postId = parseInt(params.id, 10);
  const { post, loading } = usePost(postId.toString());
  const { updatePost } = useAdminPosts();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: CreatePostDto) => {
    try {
      setSaving(true);
      await updatePost(postId, data);
      router.push('/admin/posts');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!post) {
    return <div>글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        글 수정
      </h1>
      <PostEditor initialData={post} onSave={handleSave} saving={saving} />
    </div>
  );
}
```

---

## 입력 스타일 패턴

```typescript
// 기본 텍스트 인풋
className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"

// 큰 제목 인풋
className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"

// 라벨
className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
```

---

## 버튼 스타일 패턴

```typescript
// Primary 버튼
className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"

// Secondary 버튼 (테두리)
className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"

// Danger 버튼
className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
```

---

## 접근성 (label-input 연결)

```typescript
<div>
  <label htmlFor="title" className="...">제목</label>
  <input id="title" type="text" ... />
</div>
```

## 중복 제출 방지

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    await onSave(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

## 체크리스트

- [ ] Props 인터페이스 정의 (initialData, onSave, saving)
- [ ] 상태 초기화 (initialData 사용)
- [ ] 검증 로직 구현
- [ ] 저장 버튼 disabled 처리
- [ ] 다크모드 스타일 적용
- [ ] label-input htmlFor/id 연결
- [ ] 중복 제출 방지
