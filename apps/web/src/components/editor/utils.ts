/**
 * 이미지 URL 배열에서 @dnd-kit용 안정적인 고유 ID 배열을 생성합니다.
 * - URL을 인코딩하여 안전한 ID 생성
 * - 중복 URL이 있을 경우 suffix로 구분
 */
export function generateImageIds(images: string[] | undefined): string[] {
  const seen = new Map<string, number>();
  return (images || []).map((url) => {
    const count = seen.get(url) || 0;
    seen.set(url, count + 1);
    const safeUrl = encodeURIComponent(url);
    return count === 0 ? `img-${safeUrl}` : `img-${safeUrl}-dup${count}`;
  });
}
