# 패턴 가이드

새 기능 개발 시 아래 상황에 맞는 패턴 파일을 참조하세요.

## 상황별 참조 파일

| 상황 | 참조 파일 |
|------|----------|
| 새 컴포넌트 만들기 | [frontend/component.md](frontend/component.md) |
| 새 페이지 만들기 | [frontend/page.md](frontend/page.md) |
| 커스텀 훅 만들기 | [frontend/hook.md](frontend/hook.md) |
| API 호출 함수 추가 | [frontend/api-client.md](frontend/api-client.md) |
| 폼 컴포넌트 만들기 | [frontend/form.md](frontend/form.md) |
| 새 API 모듈 만들기 | [backend/module.md](backend/module.md) |
| DB 테이블 추가 | [database/schema.md](database/schema.md) |
| 타입 정의 추가 | [shared/types.md](shared/types.md) |

## 자주 사용하는 조합

### 새 도메인 기능 추가 (예: comments, likes)
1. `database/schema.md` - Prisma 스키마 추가
2. `backend/module.md` - API 모듈 생성
3. `shared/types.md` - 프론트엔드 타입 정의
4. `frontend/api-client.md` - API 클라이언트 함수
5. `frontend/hook.md` - 커스텀 훅
6. `frontend/component.md` - UI 컴포넌트

### 새 페이지 추가
1. `frontend/page.md` - 페이지 생성
2. `frontend/component.md` - 필요한 컴포넌트

### CRUD 폼 추가
1. `frontend/form.md` - 폼 컴포넌트
2. `frontend/component.md` - 관련 UI 컴포넌트

## 시스템 문서

| 상황 | 참조 파일 |
|------|----------|
| 시스템 구조 이해 | [architecture.md](../architecture.md) |
| API 엔드포인트 확인 | [api.md](../api.md) |
| DB 구조 확인 | [database.md](../database.md) |
| 인증/인가 | [auth.md](../auth.md) |
| 테스트 작성 | [testing.md](testing.md) |
| 배포 | [deployment.md](../deployment.md) |
| 문제 해결 | [troubleshooting.md](../troubleshooting.md) |

## 개발 가이드

| 상황                     | 참조 파일                                            |
|--------------------------|------------------------------------------------------|
| Git Worktree 다중 작업   | [guides/git-worktree.md](../guides/git-worktree.md)  |

## Decision Tree

### 컴포넌트에 'use client' 필요한가?

- 이벤트 핸들러 (onClick, onChange) → 필요
- 상태 (useState, useReducer) → 필요
- 브라우저 API (localStorage, window) → 필요
- 위 조건 없음 → 불필요 (Server Component)

### 어떤 테스트를 작성할까?

- 비즈니스 로직 → 서비스 단위 테스트
- API 응답 → 컨트롤러 통합 테스트
- UI 인터랙션 → 컴포넌트 테스트
- 사용자 플로우 → E2E 테스트
