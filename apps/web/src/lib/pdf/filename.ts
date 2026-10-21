/**
 * Content-Disposition 헤더에서 파일명 추출.
 * RFC5987 형식(filename*=UTF-8''...)을 우선하고, 없으면 filename="..."을 사용
 */
export function getFilenameFromContentDisposition(
  header: string | null | undefined,
  fallback: string,
): string {
  if (!header) return fallback;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // 잘못된 인코딩이면 아래 폴백 사용
    }
  }

  const quotedMatch = header.match(/filename="((?:[^"\\]|\\.)+)"/);
  if (quotedMatch) {
    // quoted-pair 이스케이프 처리
    return quotedMatch[1].replace(/\\(.)/g, '$1');
  }

  return fallback;
}

/** 첨부 파일용 Content-Disposition 헤더 값 생성 (ASCII 폴백 + UTF-8 파일명) */
export function buildContentDisposition(asciiFilename: string, filename: string): string {
  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
