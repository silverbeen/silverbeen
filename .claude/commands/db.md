---
description: 데이터베이스 관련 명령어
---

Prisma 데이터베이스 명령어를 실행합니다.

$ARGUMENTS 옵션:
- `push`: 스키마를 DB에 푸시
- `studio`: Prisma Studio 실행
- `generate`: Prisma Client 생성
- `migrate`: 마이그레이션 생성 및 적용

```bash
case "$ARGUMENTS" in
  push)
    pnpm --filter api prisma db push
    ;;
  studio)
    pnpm --filter api prisma studio
    ;;
  generate)
    pnpm --filter api prisma generate
    ;;
  migrate)
    pnpm --filter api prisma migrate dev
    ;;
  *)
    echo "사용법: /db [push|studio|generate|migrate]"
    ;;
esac
```
