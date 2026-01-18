/**
 * 콘텐츠 길이를 기반으로 예상 읽기 시간(분)을 계산
 * @param content - 본문 텍스트
 * @param wordsPerMinute - 분당 읽는 단어 수 (기본: 200)
 */
export function getReadingTime(content: string, wordsPerMinute = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * 마크다운 콘텐츠에서 미리보기 텍스트를 추출
 * @param content - 마크다운 본문
 * @param maxLength - 최대 길이 (기본: 120)
 */
export function getPreview(content: string, maxLength = 120): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '') // 제목 마크다운 제거
    .replace(/\*\*|__/g, '') // 볼드 제거
    .replace(/\*|_/g, '') // 이탤릭 제거
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 코드 블록 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크를 텍스트로 변환
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // 이미지 제거
    .replace(/>\s/g, '') // 인용문 제거
    .replace(/-\s/g, '') // 리스트 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}
