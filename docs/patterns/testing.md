# 테스트 작성 가이드

## 개요

AIDD(AI-Driven Development)에서 테스트는 AI가 생성한 코드의 정확성을 검증하는 핵심 도구입니다.

### 테스트 철학

```
1. Red: 실패하는 테스트 먼저 작성
2. Green: 테스트를 통과하는 최소한의 코드 작성
3. Refactor: 코드 개선 (테스트는 계속 통과)
```

## 테스트 실행 명령어

```bash
# 전체 테스트
pnpm test

# 특정 파일 테스트
pnpm test -- posts.service.spec.ts

# 커버리지 리포트
pnpm test:cov

# E2E 테스트
pnpm test:e2e

# 워치 모드
pnpm test:watch
```

---

## 프론트엔드 테스트

### 컴포넌트 테스트 (React Testing Library)

#### 파일 위치

```
src/
├── components/
│   ├── PostCard.tsx
│   └── PostCard.test.tsx  ← 같은 폴더에 위치
```

#### 기본 템플릿

```typescript
// PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from './PostCard';

const mockPost = {
  id: 1,
  title: '테스트 포스트',
  slug: 'test-post',
  excerpt: '테스트 요약',
  createdAt: '2024-01-01T00:00:00.000Z',
  tags: [{ id: '1', name: 'React' }],
};

describe('PostCard', () => {
  it('포스트 제목을 렌더링한다', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
  });

  it('태그를 렌더링한다', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('클릭 시 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });
});
```

#### 비동기 컴포넌트 테스트

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('PostList', () => {
  it('로딩 상태를 표시한다', () => {
    render(<PostList />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('포스트 목록을 렌더링한다', async () => {
    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText('첫 번째 포스트')).toBeInTheDocument();
    });
  });
});
```

### 훅 테스트 (renderHook)

```typescript
// usePosts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from './usePosts';

// API Mock
jest.mock('@/lib/api', () => ({
  postsApi: {
    getList: jest.fn().mockResolvedValue({
      posts: [{ id: 1, title: '테스트' }],
      total: 1,
    }),
  },
}));

describe('usePosts', () => {
  it('초기 상태는 로딩 중이다', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
  });

  it('포스트를 로드한다', async () => {
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(1);
  });

  it('에러를 처리한다', async () => {
    const mockError = new Error('API 에러');
    jest.spyOn(postsApi, 'getList').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBe('API 에러');
    });
  });
});
```

### 폼 테스트

```typescript
// PostForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostForm } from './PostForm';

describe('PostForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('유효한 폼을 제출한다', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('제목'), '테스트 제목');
    await user.type(screen.getByLabelText('내용'), '테스트 내용');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: '테스트 제목',
      content: '테스트 내용',
    });
  });

  it('필수 필드가 비어있으면 에러를 표시한다', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

---

## 백엔드 테스트 (NestJS)

### 서비스 단위 테스트

#### 파일 위치

```
src/posts/
├── posts.service.ts
└── posts.service.spec.ts
```

#### 기본 템플릿

```typescript
// posts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('공개된 포스트 목록을 반환한다', async () => {
      const mockPosts = [
        { id: 1, title: '포스트 1', published: true },
        { id: 2, title: '포스트 2', published: true },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        })
      );
    });
  });

  describe('create', () => {
    it('새 포스트를 생성한다', async () => {
      const createDto = { title: '새 포스트', content: '내용' };
      const authorId = 'user-123';
      const mockPost = { id: 1, ...createDto, slug: 'sae-poseuteu' };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.create(createDto, authorId);

      expect(result.title).toBe('새 포스트');
      expect(mockPrismaService.post.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('본인 포스트를 삭제한다', async () => {
      const mockPost = { id: 1, authorId: 'user-123' };
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      await service.remove(1, 'user-123');

      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('다른 사용자 포스트 삭제 시 에러를 던진다', async () => {
      const mockPost = { id: 1, authorId: 'user-123' };
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.remove(1, 'other-user')).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
```

### 컨트롤러 통합 테스트

```typescript
// posts.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  describe('GET /posts', () => {
    it('포스트 목록을 반환한다', async () => {
      const mockResult = {
        posts: [{ id: 1, title: '테스트' }],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockPostsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResult);
    });
  });

  describe('POST /posts', () => {
    it('새 포스트를 생성한다', async () => {
      const createDto = { title: '새 포스트', content: '내용' };
      const mockUser = { id: 'user-123' };
      const mockPost = { id: 1, ...createDto };

      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockPost);
      expect(mockPostsService.create).toHaveBeenCalledWith(createDto, 'user-123');
    });
  });
});
```

### E2E 테스트

```typescript
// test/posts.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts', () => {
    it('200을 반환한다', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('posts');
          expect(res.body).toHaveProperty('total');
        });
    });
  });

  describe('POST /posts', () => {
    it('인증 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ title: '테스트', content: '내용' })
        .expect(401);
    });
  });
});
```

---

## Mock 패턴

### Prisma Mock

```typescript
// test/mocks/prisma.mock.ts
export const mockPrismaService = {
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  tag: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  resume: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockPrismaService)),
};
```

### Supabase Auth Mock

```typescript
// test/mocks/supabase.mock.ts
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
        },
      },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));
```

### MSW (Mock Service Worker)

API 요청 모킹

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/posts', () => {
    return HttpResponse.json({
      posts: [
        { id: 1, title: '테스트 포스트', slug: 'test' },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      slug: 'new-post',
    }, { status: 201 });
  }),

  http.get('/api/posts/:slug', ({ params }) => {
    return HttpResponse.json({
      id: 1,
      title: '테스트 포스트',
      slug: params.slug,
      content: '내용...',
    });
  }),
];
```

```typescript
// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// test/setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 테스트 커버리지 목표

| 영역 | 목표 커버리지 |
|------|--------------|
| 서비스 로직 | 80% 이상 |
| 컨트롤러 | 70% 이상 |
| 컴포넌트 | 70% 이상 |
| 훅 | 80% 이상 |
| 유틸리티 | 90% 이상 |

---

## 체크리스트

### 단위 테스트

- [ ] 정상 케이스 테스트
- [ ] 에러 케이스 테스트
- [ ] 경계값 테스트
- [ ] 빈 값/null 처리 테스트

### 통합 테스트

- [ ] API 엔드포인트 응답 확인
- [ ] 인증/인가 테스트
- [ ] 에러 응답 형식 확인

### E2E 테스트

- [ ] 주요 사용자 플로우
- [ ] 폼 제출 및 유효성 검증
- [ ] 페이지 네비게이션
