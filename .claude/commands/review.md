---
description: PR의 Gemini 코드 리뷰를 가져와 수정
---

# Gemini 코드 리뷰 반영

PR에서 Gemini Code Assist의 코드 리뷰를 가져와 자동으로 수정합니다.

## 작업 순서

### 1단계: PR 번호 확인

AskUser로 다음 내용을 질문:

```text
코드 리뷰를 반영할 PR 번호를 입력해주세요:
(예: 25)

또는 "현재" 선택 시 현재 브랜치의 PR을 자동으로 찾습니다.
```

현재 브랜치에서 PR 찾기:
```bash
gh pr view --json number --jq '.number'
```

### 2단계: Gemini 코드 리뷰 가져오기

```bash
# PR 리뷰 코멘트 가져오기
gh api repos/silverbeen/silverbeen/pulls/[PR번호]/comments
```

### 3단계: Gemini 코멘트 필터링

응답에서 `gemini-code-assist[bot]` 사용자의 코멘트만 필터링:
- `user.login`이 `gemini-code-assist[bot]`인 항목
- `body`에서 제안 내용 추출
- `path`에서 파일 경로 추출
- `line` 또는 `original_line`에서 라인 번호 추출

### 4단계: 리뷰 항목 목록 표시

AskUser로 수정할 항목 선택:

```text
Gemini가 제안한 수정 사항입니다. 적용할 항목을 선택해주세요 (복수 선택 가능):

1. [파일명:라인] 제안 요약 1
2. [파일명:라인] 제안 요약 2
3. [파일명:라인] 제안 요약 3
4. 전체 적용
```

### 5단계: 코드 수정

선택된 각 리뷰 항목에 대해:

1. 해당 파일 읽기
2. Gemini의 제안에 따라 코드 수정
3. 수정 내용을 사용자에게 보여주기

제안 유형별 처리:
- **suggestion 블록**: 제안된 코드로 직접 교체
- **일반 코멘트**: 코멘트 내용을 분석하여 적절히 수정

### 6단계: 수정 확인

각 수정 후 확인:

```text
[파일명] 수정 완료:

변경 전:
[기존 코드]

변경 후:
[수정된 코드]

이 수정을 적용할까요? (y/n/skip)
```

### 7단계: 커밋 및 푸시

모든 수정 완료 후:

```bash
# 변경된 파일 스테이징
git add [수정된 파일들]

# 커밋 (HEREDOC 사용)
git commit -m "$(cat <<'EOF'
refactor: Gemini 코드 리뷰 피드백 반영

- [수정 사항 1]
- [수정 사항 2]
- [수정 사항 3]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

# 푸시
git push origin [현재브랜치]
```

### 8단계: 리뷰 코멘트에 답글

각 반영된 리뷰 코멘트에 답글 달기:

```bash
gh api repos/silverbeen/silverbeen/pulls/[PR번호]/comments/[코멘트ID]/replies \
  -X POST \
  -f body="수정 완료했습니다. [수정 내용 요약]"
```

### 9단계: 결과 요약

```text
✅ Gemini 코드 리뷰 반영 완료

적용된 수정사항:
- [파일명:라인] 수정 내용 1
- [파일명:라인] 수정 내용 2

커밋: [커밋 해시]
PR: https://github.com/silverbeen/silverbeen/pull/[PR번호]
```

## 에러 처리

### PR을 찾을 수 없음
```text
PR #[번호]를 찾을 수 없습니다.
PR 번호를 확인해주세요.
```

### Gemini 리뷰가 없음
```text
해당 PR에 Gemini 코드 리뷰가 없습니다.
```

### 파일을 찾을 수 없음
```text
[파일명] 파일을 찾을 수 없습니다.
파일이 삭제되었거나 경로가 변경되었을 수 있습니다.
```

## 참고사항

- Gemini Code Assist 봇 ID: `gemini-code-assist[bot]`
- 리뷰 코멘트 API: `repos/{owner}/{repo}/pulls/{pull_number}/comments`
- 답글 API: `repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies`
- 프로젝트: https://github.com/silverbeen/silverbeen
