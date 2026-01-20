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
- `apps/web` - Next.js 프론트엔드
- `apps/api` - NestJS 백엔드
- `packages/ui` - 공유 UI 컴포넌트
- `packages/config` - 공유 설정
- `packages/types` - 공유 타입 정의

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

## 패턴 문서 활용

새 기능 개발 시 `/docs/patterns/index.md`를 읽고 해당 상황에 맞는 패턴 파일을 참조하세요.

| 상황 | 참조 파일 |
|------|----------|
| 새 컴포넌트 만들기 | `docs/patterns/frontend/component.md` |
| 새 페이지 만들기 | `docs/patterns/frontend/page.md` |
| 커스텀 훅 만들기 | `docs/patterns/frontend/hook.md` |
| API 호출 함수 추가 | `docs/patterns/frontend/api-client.md` |
| 폼 컴포넌트 만들기 | `docs/patterns/frontend/form.md` |
| 새 API 모듈 만들기 | `docs/patterns/backend/module.md` |
| DB 테이블 추가 | `docs/patterns/database/schema.md` |
| 타입 정의 추가 | `docs/patterns/shared/types.md` |

## 시스템 문서 활용

프로젝트 맥락 파악이 필요할 때 참조하세요.

| 상황 | 참조 파일 |
|------|----------|
| 시스템 구조 이해 | `docs/architecture.md` |
| API 작업 | `docs/api.md` |
| DB 작업 | `docs/database.md` |
| 인증 관련 | `docs/auth.md` |
| 테스트 작성 | `docs/patterns/testing.md` |
| 배포 | `docs/deployment.md` |
| 에러 해결 | `docs/troubleshooting.md` |
