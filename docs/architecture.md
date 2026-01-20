# 시스템 아키텍처

## 전체 구조

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Next.js    │────▶│   NestJS    │
│  (Browser)  │     │  (apps/web) │     │  (apps/api) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                    ┌──────┴──────┐      ┌──────┴──────┐
                    │  Supabase   │      │  PostgreSQL │
                    │    Auth     │      │  (Supabase) │
                    └─────────────┘      └─────────────┘
```

## 모노레포 구조

```
silverbeen/
├── apps/
│   ├── web/                 # Next.js 14 프론트엔드
│   │   ├── src/
│   │   │   ├── app/         # App Router 페이지
│   │   │   ├── components/  # UI 컴포넌트
│   │   │   ├── hooks/       # 커스텀 훅
│   │   │   ├── lib/         # API 클라이언트, Supabase
│   │   │   └── types/       # 타입 정의
│   │   └── public/
│   │
│   └── api/                 # NestJS 백엔드
│       ├── src/
│       │   ├── auth/        # 인증 모듈
│       │   ├── posts/       # 블로그 모듈
│       │   ├── resume/      # 이력서 모듈
│       │   ├── tags/        # 태그 모듈
│       │   └── prisma/      # DB 연결
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── ui/                  # 공유 UI 컴포넌트
│   ├── config/              # 공유 설정 (ESLint, TS)
│   └── types/               # 공유 타입 정의
│
└── docs/
    └── patterns/            # 개발 패턴 가이드
```

## 모듈 구조 (NestJS)

```
AppModule
├── PrismaModule          # 싱글톤 DB 연결
├── AuthModule            # Supabase JWT 검증
│   ├── SupabaseGuard     # JWT 토큰 검증
│   ├── AdminGuard        # 관리자 권한 확인
│   └── SupabaseStrategy  # Passport 전략
├── PostsModule           # 블로그 CRUD
├── ResumeModule          # 이력서 관리
└── TagsModule            # 태그 관리
```

## 데이터 흐름

### 읽기 요청 (공개)

```
Browser → Next.js (SSR/SSG) → NestJS API → Prisma → PostgreSQL
                                   ↓
                              캐싱 (ISR)
```

### 쓰기 요청 (인증 필요)

```
Browser → Supabase Auth (로그인)
    ↓
JWT 토큰 획득
    ↓
Browser → Next.js → NestJS API
                        ↓
              SupabaseGuard (토큰 검증)
                        ↓
              AdminGuard (권한 확인)
                        ↓
              Service → Prisma → PostgreSQL
```

## 아키텍처 결정 사항 (ADR)

### 왜 모노레포 (Turborepo)?

**결정**: pnpm + Turborepo 모노레포 구조 채택

**이유**:

- 프론트엔드/백엔드 간 타입 공유 용이
- 빌드 캐싱으로 CI/CD 속도 향상
- 단일 저장소에서 전체 프로젝트 관리
- 패키지 의존성 중앙 관리

**대안 고려**:

- 멀티 레포: 팀 규모가 작아 오버헤드
- Nx: Turborepo가 더 가볍고 설정 간단

### 왜 NestJS?

**결정**: NestJS를 백엔드 프레임워크로 선택

**이유**:

- 모듈 기반 구조로 코드 조직화 용이
- DI(Dependency Injection)로 테스트 용이
- 데코레이터 패턴으로 선언적 코드 작성
- TypeScript 네이티브 지원
- Prisma, Passport 등 에코시스템 풍부

**대안 고려**:

- Express: 구조화 부족, 대규모 프로젝트에 부적합
- Fastify: 성능 우수하나 에코시스템 제한적

### 왜 Supabase?

**결정**: Supabase를 인증 및 데이터베이스로 사용

**이유**:

- Auth + PostgreSQL + Storage 통합 솔루션
- JWT 기반 인증으로 서버리스 친화적
- Row Level Security (RLS) 지원
- 무료 티어로 프로토타입 개발 가능
- 실시간 구독 기능 (향후 확장)

**대안 고려**:

- Firebase: NoSQL이라 관계형 데이터에 부적합
- Auth0: 인증만 제공, 별도 DB 필요
- 자체 구현: 개발 시간 증가

### 왜 Next.js App Router?

**결정**: Next.js 14 App Router 사용

**이유**:

- Server Components로 번들 크기 감소
- 스트리밍 SSR로 빠른 초기 로딩
- 파일 기반 라우팅 직관적
- ISR로 정적/동적 페이지 혼합
- Vercel 배포 최적화

**대안 고려**:

- Pages Router: 레거시, Server Components 미지원
- Remix: Vercel 통합 제한적
- SPA (Vite): SEO 불리

## 보안 아키텍처

### 인증 레이어

```
1. Supabase Auth (외부)
   - OAuth, 이메일/비밀번호 인증
   - JWT 토큰 발급

2. NestJS Guards (내부)
   - SupabaseGuard: JWKS로 토큰 서명 검증
   - AdminGuard: 역할 기반 접근 제어

3. Prisma (데이터)
   - authorId로 소유권 확인
   - 삭제/수정 시 권한 검증
```

### API 보안

| 엔드포인트 | 인증 | 권한 |
|-----------|------|------|
| GET /posts | 없음 | 공개 |
| POST /posts | 필요 | Admin |
| PUT /posts/:id | 필요 | Admin + 소유자 |
| DELETE /posts/:id | 필요 | Admin + 소유자 |
| GET /resume | 없음 | 공개 |
| PUT /resume | 없음 (개선 필요) | - |

## 확장 고려사항

### 수평 확장

- **프론트엔드**: Vercel Edge Functions
- **백엔드**: Railway 컨테이너 스케일링
- **데이터베이스**: Supabase 커넥션 풀링

### 캐싱 전략

- **ISR**: 블로그 목록/상세 페이지 (revalidate: 60)
- **클라이언트**: SWR/React Query (향후)
- **서버**: Redis (향후)

### 모니터링 (향후)

- Vercel Analytics (프론트엔드)
- Railway Metrics (백엔드)
- Sentry (에러 트래킹)
