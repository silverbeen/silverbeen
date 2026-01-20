# API 명세

## 기본 정보

### Base URL

| 환경 | URL |
|------|-----|
| 개발 | `http://localhost:3001` |
| 프로덕션 | Railway 배포 URL |

### 인증

보호된 엔드포인트는 Supabase JWT 토큰이 필요합니다.

```
Authorization: Bearer <supabase_access_token>
```

### 공통 응답 형식

#### 성공 응답

```json
{
  "data": { ... }
}
```

#### 에러 응답

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (유효성 검증 실패) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |
| 500 | 서버 에러 |

---

## Posts API

### GET /posts

공개된 포스트 목록을 조회합니다.

#### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 10 | 페이지당 개수 |
| tag | string | - | 태그 필터 |
| sortBy | string | createdAt | 정렬 기준 (createdAt, viewCount, title) |
| order | string | desc | 정렬 순서 (asc, desc) |

#### 응답

```json
{
  "posts": [
    {
      "id": 1,
      "slug": "hello-world",
      "title": "Hello World",
      "excerpt": "첫 번째 포스트입니다",
      "coverImage": "https://...",
      "published": true,
      "viewCount": 100,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "tags": [
        { "id": "uuid", "name": "React" }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### GET /posts/admin

관리자용 포스트 목록 (미공개 포함)

**인증**: SupabaseGuard + AdminGuard

#### 응답

`GET /posts`와 동일, published 상태와 관계없이 모든 포스트 반환

### GET /posts/:idOrSlug

포스트 상세 조회 (ID 또는 slug로 조회)

#### 응답

```json
{
  "id": 1,
  "slug": "hello-world",
  "title": "Hello World",
  "content": "# 마크다운 내용...",
  "excerpt": "첫 번째 포스트입니다",
  "coverImage": "https://...",
  "published": true,
  "viewCount": 100,
  "authorId": "supabase-user-id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "tags": [
    { "id": "uuid", "name": "React" }
  ]
}
```

### POST /posts

새 포스트 생성

**인증**: SupabaseGuard + AdminGuard

#### 요청 바디

```json
{
  "title": "포스트 제목",
  "content": "마크다운 내용",
  "excerpt": "요약 (선택)",
  "coverImage": "https://... (선택)",
  "published": false,
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

#### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | O | 포스트 제목 |
| content | string | O | 마크다운 본문 |
| excerpt | string | X | 요약문 |
| coverImage | string | X | 커버 이미지 URL |
| published | boolean | X | 공개 여부 (기본: false) |
| tagIds | string[] | X | 연결할 태그 ID 배열 |

#### 응답

생성된 포스트 객체 (slug 자동 생성)

### PUT /posts/:id

포스트 수정

**인증**: SupabaseGuard + AdminGuard

#### 요청 바디

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "published": true,
  "tagIds": ["tag-uuid-1"]
}
```

모든 필드 선택사항 (부분 업데이트 지원)

#### 비즈니스 로직

- 제목 변경 시 slug 자동 재생성
- 기존 태그 연결 해제 후 새 태그 연결

### DELETE /posts/:id

포스트 삭제

**인증**: SupabaseGuard + AdminGuard

#### 응답

```json
{
  "id": 1,
  "title": "삭제된 포스트"
}
```

### POST /posts/:slug/view

조회수 증가 (공개 API)

#### 응답

```json
{
  "viewCount": 101
}
```

### GET /posts/:id/adjacent

이전/다음 포스트 조회

#### 응답

```json
{
  "prevPost": {
    "id": 2,
    "title": "이전 포스트",
    "slug": "prev-post"
  },
  "nextPost": {
    "id": 4,
    "title": "다음 포스트",
    "slug": "next-post"
  }
}
```

---

## Tags API

### GET /tags

모든 태그 목록 조회

#### 응답

```json
[
  {
    "id": "uuid",
    "name": "React",
    "_count": {
      "posts": 5
    }
  }
]
```

### POST /tags

새 태그 생성

**인증**: SupabaseGuard + AdminGuard

#### 요청 바디

```json
{
  "name": "TypeScript"
}
```

#### 에러

- 409 Conflict: 이미 존재하는 태그명

### DELETE /tags/:id

태그 삭제

**인증**: SupabaseGuard + AdminGuard

---

## Resume API

### GET /resume

이력서 조회

#### 응답

```json
{
  "id": "main",
  "content": {
    "profile": {
      "name": "홍길동",
      "title": "Frontend Developer",
      "email": "email@example.com"
    },
    "skills": { ... },
    "experience": [ ... ],
    "education": [ ... ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /resume

이력서 업데이트

**주의**: 현재 인증 없음 (보안 개선 필요)

#### 요청 바디

```json
{
  "content": {
    "profile": { ... },
    "skills": { ... },
    "experience": [ ... ],
    "education": [ ... ]
  }
}
```

---

## 페이지네이션

### 요청

```
GET /posts?page=2&limit=10
```

### 응답

```json
{
  "posts": [...],
  "total": 50,
  "page": 2,
  "totalPages": 5
}
```

### 클라이언트 사용 예시

```typescript
const { posts, totalPages } = await postsApi.getList({
  page: currentPage,
  limit: 10,
  tag: selectedTag,
  sortBy: 'createdAt',
  order: 'desc'
});
```

---

## 정렬 및 필터링

### 정렬 옵션

| sortBy | 설명 |
|--------|------|
| createdAt | 생성일 기준 (기본) |
| viewCount | 조회수 기준 |
| title | 제목 기준 |

### 필터링

```
GET /posts?tag=React
```

태그명으로 포스트 필터링

---

## 에러 처리 예시

### 유효성 검증 실패 (400)

```json
{
  "statusCode": 400,
  "message": ["title must be a string", "content should not be empty"],
  "error": "Bad Request"
}
```

### 인증 실패 (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 권한 없음 (403)

```json
{
  "statusCode": 403,
  "message": "관리자 권한이 필요합니다",
  "error": "Forbidden"
}
```

### 리소스 없음 (404)

```json
{
  "statusCode": 404,
  "message": "포스트를 찾을 수 없습니다",
  "error": "Not Found"
}
```

---

## 클라이언트 사용 예시

```typescript
// 목록 조회
const { posts } = await postsApi.getList({ page: 1, limit: 10 });

// 상세 조회
const post = await postsApi.getBySlug('hello-world');

// 생성 (인증 필요)
const token = await getAccessToken();
const newPost = await postsApi.create({
  title: '새 포스트',
  content: '내용...'
}, token);

// 조회수 증가
await postsApi.incrementView('hello-world');
```
