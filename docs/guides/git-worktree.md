# Git Worktree를 활용한 다중 작업 가이드

Git worktree를 사용하면 하나의 저장소에서 여러 브랜치를 동시에 다른 디렉토리에서 작업할 수 있습니다. Claude Code와 함께 사용하면 여러 작업을 병렬로 진행할 수 있습니다.

## 디렉토리 구조

```
~/Desktop/dev/
├── silverbeen/              # 메인 (main 브랜치)
├── silverbeen-task-1/       # worktree 1
├── silverbeen-task-2/       # worktree 2
└── silverbeen-task-3/       # worktree 3
```

## 기본 명령어

### Worktree 생성

```bash
# 새 브랜치와 함께 생성
git worktree add ../silverbeen-task-1 -b task/workspace-1

# 기존 브랜치로 생성
git worktree add ../silverbeen-bugfix bugfix/issue-123
```

### Worktree 목록 확인

```bash
git worktree list
```

### Worktree 제거

```bash
git worktree remove ../silverbeen-task-1
```

## Claude Code 다중 작업 실행

### 1. 각 worktree 초기 설정 (최초 1회)

```bash
# Task 1
cd ~/Desktop/dev/silverbeen-task-1
pnpm install

# Task 2
cd ~/Desktop/dev/silverbeen-task-2
pnpm install

# Task 3
cd ~/Desktop/dev/silverbeen-task-3
pnpm install
```

### 2. 각 터미널에서 Claude Code 실행

```bash
# 터미널 1
cd ~/Desktop/dev/silverbeen-task-1
claude

# 터미널 2
cd ~/Desktop/dev/silverbeen-task-2
claude

# 터미널 3
cd ~/Desktop/dev/silverbeen-task-3
claude
```

### 3. 작업 시작 전 브랜치 설정

```bash
# 새 브랜치 생성
git checkout -b feat/my-new-feature

# 또는 기존 브랜치로 전환
git checkout existing-branch
```

## 개발 서버 실행 시 포트 설정

여러 worktree에서 동시에 개발 서버를 실행할 경우 포트 충돌을 피해야 합니다.

```bash
# worktree 1 (기본 포트)
pnpm dev

# worktree 2 (다른 포트)
PORT=3001 pnpm dev

# worktree 3 (다른 포트)
PORT=3002 pnpm dev
```

## 주의사항

1. **node_modules**: 각 worktree에서 `pnpm install` 필요
2. **환경 변수**: `.env` 파일은 각 worktree에 복사 필요
   ```bash
   cp apps/api/.env ../silverbeen-task-1/apps/api/.env
   ```
3. **브랜치 충돌**: 같은 브랜치를 여러 worktree에서 체크아웃할 수 없음
4. **정리**: 작업 완료 후 worktree 제거 권장

## 작업 완료 후 정리

```bash
# 1. 변경사항 커밋 & 푸시
cd ~/Desktop/dev/silverbeen-task-1
git add .
git commit -m "feat: 작업 완료"
git push origin feat/my-feature

# 2. 메인 저장소로 이동
cd ~/Desktop/dev/silverbeen

# 3. worktree 제거
git worktree remove ../silverbeen-task-1

# 4. (선택) 브랜치 삭제
git branch -d task/workspace-1
```

## 유용한 팁

### 모든 worktree 상태 확인

```bash
git worktree list
```

### worktree 강제 제거 (변경사항 무시)

```bash
git worktree remove --force ../silverbeen-task-1
```

### 현재 worktree 정보 확인

```bash
git rev-parse --show-toplevel
```
