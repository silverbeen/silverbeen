# 데이터베이스 구조

## 개요

- **DBMS**: PostgreSQL (Supabase 호스팅)
- **ORM**: Prisma
- **스키마 위치**: `apps/api/prisma/schema.prisma`

## ERD (Entity Relationship Diagram)

```text
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ role (ENUM)     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│      Post       │         │      Tag        │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄──n:m──►│ id (PK)         │
│ authorId        │         │ name (UNIQUE)   │
│ title           │         └─────────────────┘
│ slug (UNIQUE)   │
│ content         │
│ excerpt         │
│ coverImage      │
│ published       │
│ viewCount       │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│     Resume      │
├─────────────────┤
│ id (PK) = "main"│  ← 싱글톤
│ content (JSON)  │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## 모델 상세

### User

관리자 인증 및 역할 관리용 모델

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | Supabase Auth ID와 동기화 |
| email | String | 로그인 이메일 (고유) |
| name | String? | 표시 이름 |
| role | Role | USER 또는 ADMIN |

### Post

블로그 게시물

```prisma
model Post {
  id         Int      @id @default(autoincrement())
  authorId   String
  title      String
  slug       String   @unique
  content    String
  excerpt    String?
  coverImage String?
  published  Boolean  @default(false)
  viewCount  Int      @default(0)
  tags       Tag[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([authorId])
  @@index([slug])
  @@index([published])
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Int | Auto-increment PK |
| authorId | String | Supabase Auth 사용자 ID (User와 논리적 관계) |
| title | String | 포스트 제목 |
| slug | String | URL 친화적 식별자 (자동 생성) |
| content | String | 마크다운 본문 |
| excerpt | String? | 요약문 (목록 표시용) |
| coverImage | String? | 커버 이미지 URL |
| published | Boolean | 공개 여부 |
| viewCount | Int | 조회수 |
| tags | Tag[] | 연결된 태그 (M:N) |

#### 인덱스

- `authorId`: 작성자별 조회 최적화
- `slug`: slug로 조회 최적화
- `published`: 공개 포스트 필터링 최적화

### Tag

게시물 분류용 태그

```prisma
model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | 고유 식별자 |
| name | String | 태그명 (고유) |
| posts | Post[] | 연결된 포스트 (M:N) |

### Resume

이력서 데이터 (싱글톤)

```prisma
model Resume {
  id        String   @id @default("main")
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 항상 "main" (싱글톤) |
| content | Json | 전체 이력서 데이터 |

#### content JSON 구조

```typescript
interface ResumeContent {
  profile: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  skills: {
    frontend: string[];
    backend: string[];
    database: string[];
    devops: string[];
    etc: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    period: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    period: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}
```

## 관계

### Post ↔ Tag (다대다)

```prisma
// Post
tags Tag[]

// Tag
posts Post[]
```

Prisma가 자동으로 중간 테이블 `_PostToTag` 생성

#### 연결/해제 방법

```typescript
// 태그 연결
await prisma.post.update({
  where: { id: postId },
  data: {
    tags: {
      connect: tagIds.map(id => ({ id }))
    }
  }
});

// 기존 태그 모두 해제 후 새로 연결
await prisma.post.update({
  where: { id: postId },
  data: {
    tags: {
      set: tagIds.map(id => ({ id }))
    }
  }
});
```

## 명령어

### 스키마 변경 적용

```bash
# 개발 환경 (마이그레이션 없이)
pnpm db:push

# 프로덕션 (마이그레이션 생성)
pnpm db:migrate
```

### Prisma Studio

```bash
pnpm db:studio
```

브라우저에서 데이터 조회/수정 가능

### 클라이언트 재생성

```bash
pnpm db:generate
```

스키마 변경 후 TypeScript 타입 업데이트

## 마이그레이션 가이드

### 새 필드 추가

1. `schema.prisma` 수정
2. 기본값 설정 (기존 데이터 호환)
3. `pnpm db:push` 실행

```prisma
// 예: Post에 새 필드 추가
model Post {
  // 기존 필드...
  likes Int @default(0)  // 기본값 필수
}
```

### 필수 필드 추가

1. 선택 필드로 먼저 추가
2. 기존 데이터 마이그레이션
3. 필수로 변경

```prisma
// Step 1: 선택 필드로 추가
category String?

// Step 2: 데이터 마이그레이션 (Prisma Studio 또는 스크립트)

// Step 3: 필수로 변경
category String @default("general")
```

### 관계 추가

```prisma
// 새 모델 추가
model Comment {
  id        Int      @id @default(autoincrement())
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime @default(now())
}

// Post에 관계 추가
model Post {
  // 기존 필드...
  comments Comment[]
}
```

## 성능 최적화

### 인덱스 전략

```prisma
// 단일 인덱스
@@index([authorId])

// 복합 인덱스
@@index([published, createdAt])

// 유니크 인덱스
@@unique([email])
```

### N+1 문제 방지

```typescript
// 나쁜 예: N+1 쿼리
const posts = await prisma.post.findMany();
for (const post of posts) {
  const tags = await prisma.tag.findMany({
    where: { posts: { some: { id: post.id } } }
  });
}

// 좋은 예: 한 번에 조회
const posts = await prisma.post.findMany({
  include: { tags: true }
});
```

### 필요한 필드만 선택

```typescript
// 목록 조회 시 content 제외
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    createdAt: true,
    tags: true
    // content는 제외 (용량이 큼)
  }
});
```

## 환경 변수

```env
# .env
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database"
```

| 변수 | 용도 |
|------|------|
| DATABASE_URL | 애플리케이션 연결 (커넥션 풀링) |
| DIRECT_URL | 마이그레이션 (직접 연결) |

## 백업 및 복구

Supabase 대시보드에서 자동 백업 관리

- 일일 백업 (무료 티어)
- Point-in-time Recovery (Pro 티어)
