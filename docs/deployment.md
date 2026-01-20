# 배포 가이드

## 배포 환경

| 서비스 | 플랫폼 | URL |
|--------|--------|-----|
| Frontend | Vercel | silverbeen.vercel.app |
| Backend | Railway | api.silverbeen.app |
| Database | Supabase | PostgreSQL |

## 환경 변수

### Backend (Railway)

```env
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.silverbeen.app
NEXT_PUBLIC_SITE_URL=https://silverbeen.vercel.app
```

## 배포 명령어

```bash
# 빌드 테스트
pnpm build

# 타입 체크
pnpm type-check

# DB 마이그레이션
pnpm db:push
```

## 배포 체크리스트

### 배포 전

- [ ] `pnpm build` 성공 확인
- [ ] `pnpm type-check` 에러 없음
- [ ] 환경 변수 설정 확인
- [ ] DB 마이그레이션 필요 여부 확인

### 배포 후

- [ ] 사이트 접속 확인
- [ ] API 응답 확인
- [ ] 로그인 테스트
- [ ] 주요 기능 동작 확인

## 롤백

### Vercel

Vercel 대시보드 > Deployments > 이전 배포 선택 > "Promote to Production"

### Railway

Railway 대시보드 > Deployments > 이전 배포로 롤백
