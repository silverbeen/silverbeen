# Silverbeen

개인 이력서 + 블로그 + 이력서 빌더 플랫폼

## 기술 스택

| 영역 | 기술 |
|------|------|
| **모노레포** | Turborepo + pnpm |
| **프론트엔드** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **백엔드** | NestJS, TypeScript, Prisma |
| **데이터베이스** | Supabase (PostgreSQL) |
| **인증** | Supabase Auth |
| **배포** | Vercel (프론트) + Railway (백엔드) |

## 프로젝트 구조

```
silverbeen/
├── apps/
│   ├── web/          # Next.js 프론트엔드
│   └── api/          # NestJS 백엔드
├── packages/
│   ├── ui/           # 공유 UI 컴포넌트
│   ├── config/       # 공유 설정
│   └── types/        # 공유 타입 정의
└── ...
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
# apps/web
cp apps/web/.env.example apps/web/.env.local

# apps/api
cp apps/api/.env.example apps/api/.env
```

### 3. 개발 서버 실행

```bash
# 전체 실행
pnpm dev

# 프론트엔드만
pnpm --filter web dev

# 백엔드만
pnpm --filter api dev
```

## 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint 검사 |
| `pnpm type-check` | TypeScript 타입 체크 |
| `pnpm db:push` | Prisma 스키마 푸시 |
| `pnpm db:studio` | Prisma Studio 실행 |

## 디자인 시스템

- 메인 컬러: `#514EF6`
- 다크/라이트 모드 지원
