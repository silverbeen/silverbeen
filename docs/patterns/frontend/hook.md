# 커스텀 훅 패턴

## 파일 위치
```
apps/web/src/hooks/use{Entity}.ts
apps/web/src/hooks/index.ts  # barrel export
```

---

## 데이터 페칭 훅 (Read Only)

목록 조회, 단일 항목 조회용.

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Post, PostListResponse } from '@/types/post';

export function usePosts(params?: {
  tag?: string;
  page?: number;
  sortBy?: 'createdAt' | 'viewCount' | 'title';
  order?: 'asc' | 'desc';
}) {
  const [data, setData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.posts.getList({
        page: params?.page,
        tag: params?.tag,
        sortBy: params?.sortBy,
        order: params?.order,
      });
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.tag, params?.sortBy, params?.order]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}
```

---

## 단일 항목 조회 훅

```typescript
export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.posts.getBySlug(slug);
        setPost(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
}
```

---

## 관리용 훅 (CRUD + 인증)

Admin 페이지에서 사용. 생성/수정/삭제 포함.

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Post, CreatePostDto, UpdatePostDto } from '@/types/post';

export function useAdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // 목록 조회
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      const response = await api.posts.getAdminList(session.access_token);
      setPosts(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 생성
  const createPost = async (data: CreatePostDto) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const newPost = await api.posts.create(data, session.access_token);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  // 수정
  const updatePost = async (id: number, data: UpdatePostDto) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    const updatedPost = await api.posts.update(id, data, session.access_token);
    setPosts((prev) => prev.map((post) => (post.id === id ? updatedPost : post)));
    return updatedPost;
  };

  // 삭제
  const deletePost = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    await api.posts.delete(id, session.access_token);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}
```

---

## barrel export (index.ts)

```typescript
export { usePosts, usePost, useAdminPosts } from './usePosts';
export { useTags } from './useTags';
export { useResume } from './useResume';
```

---

## 상태 업데이트 패턴

```typescript
// 새 항목 추가 (맨 앞)
setItems((prev) => [newItem, ...prev]);

// 항목 수정
setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

// 항목 삭제
setItems((prev) => prev.filter((item) => item.id !== id));
```

---

## 요청 취소 (AbortController)

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      // ...
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    }
  };

  fetchData();
  return () => controller.abort();
}, [url]);
```

## 체크리스트

- [ ] 'use client' 추가
- [ ] loading, error 상태 포함
- [ ] useCallback으로 fetch 함수 메모이제이션
- [ ] refetch 함수 반환
- [ ] barrel export 추가 (index.ts)
- [ ] CRUD 함수에서 인증 토큰 처리
- [ ] 필요시 AbortController로 요청 취소
