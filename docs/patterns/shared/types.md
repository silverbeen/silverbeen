# 타입 정의 패턴

## 파일 위치
```
apps/web/src/types/{entity}.ts
apps/web/src/types/index.ts  # barrel export (선택)
```

---

## Entity 타입 템플릿

```typescript
// 기본 Entity 타입
export interface Entity {
  id: number;              // 또는 string (UUID)
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  viewCount: number;
  tags: Tag[];
  createdAt: string;       // ISO 날짜 문자열
  updatedAt: string;
}

// 관계 타입
export interface Tag {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}
```

---

## DTO 타입

### Create DTO

```typescript
export interface CreateEntityDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}
```

### Update DTO

```typescript
export interface UpdateEntityDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}
```

---

## Response 타입

### 목록 응답 (페이지네이션)

```typescript
export interface EntityListResponse {
  items: Entity[];      // 또는 posts, tags 등 명시적 이름
  total: number;
  page: number;
  totalPages: number;
}
```

### 관계 데이터 응답

```typescript
export interface AdjacentEntity {
  id: number;
  title: string;
  slug: string;
}

export interface AdjacentEntitiesResponse {
  prevItem: AdjacentEntity | null;
  nextItem: AdjacentEntity | null;
}
```

---

## 실제 예시 (Post 타입)

```typescript
// apps/web/src/types/post.ts

export interface Tag {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  viewCount: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}

export interface CreateTagDto {
  name: string;
}

export interface AdjacentPost {
  id: number;
  title: string;
  slug: string;
}

export interface AdjacentPostsResponse {
  prevPost: AdjacentPost | null;
  nextPost: AdjacentPost | null;
}
```

---

## 타입 사용 패턴

### 컴포넌트에서 import

```typescript
import type { Post, Tag } from '@/types/post';

interface PostCardProps {
  post: Post;
}
```

### 훅에서 import

```typescript
import type { Post, PostListResponse, CreatePostDto } from '@/types/post';
```

### API 클라이언트에서 import

```typescript
import type {
  Entity,
  EntityListResponse,
  CreateEntityDto,
  UpdateEntityDto,
} from '@/types/entity';
```

---

## 네이밍 규칙

| 용도 | 네이밍 | 예시 |
|------|--------|------|
| Entity | PascalCase 단수 | `Post`, `Tag`, `User` |
| 목록 응답 | Entity + ListResponse | `PostListResponse` |
| 생성 DTO | Create + Entity + Dto | `CreatePostDto` |
| 수정 DTO | Update + Entity + Dto | `UpdatePostDto` |
| 관계 응답 | Adjacent + Entity + Response | `AdjacentPostsResponse` |

---

## 체크리스트

- [ ] 기본 Entity 타입 정의
- [ ] 선택적 필드는 `?` 또는 `| null` 처리
- [ ] Create/Update DTO 분리
- [ ] Response 타입 정의 (페이지네이션)
- [ ] 관계 타입 정의 (Tag 등)
- [ ] `type` 키워드로 import (import type)
