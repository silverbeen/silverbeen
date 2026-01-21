# 문제 해결 가이드

## Prisma 관련

### "Can't reach database server"

```bash
# 환경 변수 확인
echo $DATABASE_URL

# DB 연결 테스트
pnpm db:studio
```

### 스키마 충돌

```bash
# 스키마 재동기화
pnpm db:push --force-reset  # 주의: 데이터 삭제됨
```

### 타입 에러

```bash
# Prisma 클라이언트 재생성
pnpm db:generate
```

## 인증 관련

### "Unauthorized" (401)

1. 토큰 만료 → 재로그인
2. Authorization 헤더 확인: `Bearer <token>` 형식
3. 환경 변수 `SUPABASE_JWT_SECRET` 확인

### "Forbidden" (403)

1. Supabase 대시보드에서 user_metadata 확인
2. `role: "admin"` 또는 `is_admin: true` 설정 필요

## 빌드 관련

### 타입 에러

```bash
pnpm type-check
```

### 모듈 해석 에러

```bash
# node_modules 재설치
rm -rf node_modules
pnpm install
```

### Turborepo 캐시 문제

```bash
pnpm turbo clean
pnpm build
```

## 개발 서버

### 포트 충돌

```bash
# 포트 사용 프로세스 확인
lsof -i :3000
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

### 핫 리로드 안됨

```bash
# 개발 서버 재시작
pnpm dev
```

## 환경 변수

### 변수 로드 안됨

1. `.env.local` 파일 존재 확인
2. 변수명 앞에 `NEXT_PUBLIC_` 확인 (클라이언트용)
3. 개발 서버 재시작
