# Silverbeen - 이력서 & 블로그 플랫폼

## 프로젝트 개요
개인 이력서 + 블로그 + 이력서 빌더 기능을 갖춘 풀스택 웹 애플리케이션

## 기술 스택
- **모노레포**: Turborepo + pnpm
- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **백엔드**: NestJS, TypeScript, Prisma
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **배포**: Vercel (프론트) + Railway (백엔드)

## 프로젝트 구조

```text
apps/
├── web/src/                    # Next.js 프론트엔드
│   ├── app/                    # 페이지 (App Router)
│   │   └── admin/              # 어드민 페이지들
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # 공통 UI (shadcn/ui)
│   │   └── {도메인}/           # 도메인별 컴포넌트
│   ├── lib/                    # 유틸리티
│   │   ├── api/                # API 호출 함수
│   │   └── supabase/           # Supabase 클라이언트
│   └── hooks/                  # 커스텀 훅
├── api/src/                    # NestJS 백엔드
│   ├── {도메인}/               # 도메인 모듈 (controller, service, dto)
│   └── prisma/                 # Prisma 스키마
packages/
├── types/src/                  # 공유 타입
└── ui/                         # 공유 UI 컴포넌트
```

## 개발 명령어
- `pnpm dev` - 전체 개발 서버 실행
- `pnpm build` - 전체 빌드
- `pnpm lint` - 린트 검사
- `pnpm type-check` - 타입 체크
- `pnpm db:push` - Prisma 스키마 푸시
- `pnpm db:studio` - Prisma Studio 실행

## 디자인 시스템
- 메인 컬러: #514EF6 (Indigo-Violet)
- 다크모드 지원 (next-themes 사용)
- Tailwind CSS 커스텀 컬러 팔레트 적용

### Primary 컬러 팔레트
| 단계 | HEX |
|------|-----|
| 50 | #EEEEFF |
| 100 | #DCDCFF |
| 200 | #B8B5FF |
| 300 | #9490FF |
| 400 | #706FFA |
| **500** | **#514EF6** |
| 600 | #4240D4 |
| 700 | #3533B2 |
| 800 | #282690 |
| 900 | #1C1A6E |
| 950 | #0F0E4A |

## 코딩 컨벤션

### 프론트엔드 (Next.js)
- App Router 사용 (pages 디렉토리 사용 금지)
- Server Components 우선, 필요시에만 "use client"
- 컴포넌트는 함수형으로 작성
- shadcn/ui 컴포넌트 활용
- Tailwind CSS 클래스 사용 (인라인 스타일 금지)

### 백엔드 (NestJS)
- 모듈별 폴더 구조 유지
- DTO에 class-validator 사용
- Prisma 서비스는 싱글톤으로 관리
- 에러는 NestJS 내장 예외 클래스 사용

### 공통
- TypeScript strict 모드 사용
- ESLint + Prettier 규칙 준수
- 커밋 메시지는 Conventional Commits 형식

## 환경 변수
- `.env.local` - 로컬 개발용 (git 무시)
- `.env.example` - 환경 변수 템플릿

## 주의사항
- Supabase 크레덴셜은 절대 커밋하지 않기
- API 키는 서버 사이드에서만 사용
- 이미지는 Supabase Storage 또는 외부 CDN 사용

## 필수 규칙

### 어드민 페이지
- `/admin/*` 페이지 추가 시 → `apps/web/src/app/admin/page.tsx`의 `menuItems` 배열에 메뉴 추가 필수

### 컴포넌트
- Server Component 우선, `useState`/`onClick`/`useEffect` 있을 때만 `'use client'`
- UI 컴포넌트 → `apps/web/src/components/ui/` (shadcn/ui 스타일)
- 도메인 컴포넌트 → `apps/web/src/components/{도메인}/`

### API
- 프론트 API 호출 → `apps/web/src/lib/api/`에 함수 추가
- 백엔드 모듈 → `apps/api/src/{도메인}/` (controller, service, dto, module)

### 데이터베이스
- 스키마 수정 → `apps/api/prisma/schema.prisma` 후 `pnpm db:push`

### 타입
- 공유 타입 → `packages/types/src/`

### 스타일
- Tailwind CSS만 사용, 인라인 스타일 금지
- Primary 컬러: `primary-500` (#514EF6)
- **예외**:
  - @dnd-kit 드래그앤드롭 라이브러리는 동적 transform/transition을 위해 인라인 스타일 허용
  - 진행률 바 등 동적 width/height가 필요한 경우 인라인 스타일 허용

## 상세 패턴 문서

복잡한 예시 코드가 필요하면 해당 docs 파일을 읽을 것:
- 새 API 모듈 → `docs/patterns/backend/module.md`
- DB 스키마 → `docs/patterns/database/schema.md`
- 폼 컴포넌트 → `docs/patterns/frontend/form.md`
