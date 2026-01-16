---
description: 개발 서버 실행
---

개발 서버를 실행합니다.

$ARGUMENTS가 비어있으면 전체 실행, 특정 앱 지정 가능:
- `web`: 프론트엔드만
- `api`: 백엔드만
- (빈값): 전체

```bash
if [ -z "$ARGUMENTS" ]; then
  pnpm dev
elif [ "$ARGUMENTS" = "web" ]; then
  pnpm --filter web dev
elif [ "$ARGUMENTS" = "api" ]; then
  pnpm --filter api dev
fi
```
