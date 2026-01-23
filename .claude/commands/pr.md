---
description: GitHub Pull Request 생성
---

# GitHub PR 생성

현재 브랜치의 Pull Request를 자동으로 생성합니다.

## 작업 순서

### 1단계: PR 타입 선택

AskUser로 다음 내용을 질문:

```text
PR 타입을 선택해주세요:

1. feat: 새로운 기능 추가
2. fix: 버그 수정
3. refactor: 리팩토링
4. style: 스타일/UI 변경
5. docs: 문서 변경
6. chore: 기타 작업
```

### 2단계: 타겟 브랜치 선택

AskUser로 다음 내용을 질문:

```text
타겟 브랜치를 선택해주세요:

1. master (기본)
2. develop
3. 직접 입력
```

### 3단계: Git 정보 확인

```bash
# 현재 브랜치 확인
git branch --show-current

# 원격에 푸시 여부 확인
git status

# 푸시 안 된 경우 먼저 푸시
git push -u origin $(git branch --show-current)
```

### 4단계: 변경사항 분석

```bash
# 타겟 브랜치와의 diff 확인
git diff [타겟브랜치]...HEAD --stat

# 커밋 히스토리 확인
git log [타겟브랜치]..HEAD --oneline
```

### 5단계: PR 제목 생성 규칙

- **필수: PR 제목에 이슈 번호 포함** (예: `feat: #1 이력서 컴포넌트 생성`)
- 브랜치명에서 타입과 이슈 번호 추출
- 예: `feat/#1-createComponentForResume` → `feat: #1 이력서 컴포넌트 생성`
- 사용자가 선택한 PR 타입 우선 적용
- 제목은 한국어로 작성
- **이슈 번호가 브랜치명에 없으면 AskUser로 이슈 번호 질문**

#### PR 제목 형식

```
[타입]: #[이슈번호] [설명]
```

예시:

- `[Feature]: #1 이력서 컴포넌트 생성`
- `[Fix]]: #25 로그인 버그 수정`
- `[Refactor]: #36 AdminGuard 리팩토링`

### 6단계: PR 본문 자동 생성

```markdown
## 변경 사항

- [커밋 메시지를 한국어로 요약]

## 변경된 파일

- [파일 경로와 변경 라인 수]

## 관련 이슈

- Closes #[이슈번호] (브랜치명에서 추출, 있는 경우)

## 테스트

- [ ] 로컬에서 테스트 완료
- [ ] 빌드 성공 확인

## 체크리스트

- [ ] 코드 리뷰 완료
- [ ] 타입 체크 통과
```

### 7단계: PR 미리보기 및 생성 확인

생성될 PR 내용을 미리보기로 보여주고 확인 질문:

```text
아래 내용으로 PR을 생성할까요? (y/n)

---
**제목:** [PR 제목]
**소스:** [소스 브랜치] → **타겟:** [타겟 브랜치]

[PR 본문 미리보기]
---
```

### 8단계: GitHub CLI로 PR 생성

```bash
gh pr create \
  --title "PR 제목" \
  --body "PR 본문" \
  --base [타겟브랜치] \
  --head [현재브랜치]
```

### 9단계: 결과 처리

- 성공: PR URL 표시
- 실패 시:
  - 이미 PR 존재: 기존 PR URL 표시 (`gh pr view --web`)
  - 브랜치 미푸시: `git push -u origin [브랜치명]` 실행
  - 변경사항 없음: 안내 메시지 표시

## 에러 처리

### gh CLI 미설치

```text
GitHub CLI(gh)가 설치되어 있지 않습니다.
설치: brew install gh
인증: gh auth login
```

### 인증 안됨

```text
GitHub 인증이 필요합니다.
실행: gh auth login
```

## 참고사항

- 프로젝트 URL: https://github.com/silverbeen/silverbeen
- 메인 브랜치: master
- PR 생성 후 자동으로 브라우저에서 열기 가능 (`--web` 옵션)
- Draft PR: 제목 앞에 `[Draft]` 추가 또는 `--draft` 옵션 사용
