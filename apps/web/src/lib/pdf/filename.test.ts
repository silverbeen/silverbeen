import { describe, expect, it } from 'vitest';
import { buildContentDisposition, getFilenameFromContentDisposition } from './filename';

describe('getFilenameFromContentDisposition', () => {
  it('UTF-8 파일명을 우선 사용한다', () => {
    const header = buildContentDisposition('resume.pdf', '이력서_홍길동.pdf');
    expect(getFilenameFromContentDisposition(header, 'fallback.pdf')).toBe('이력서_홍길동.pdf');
  });

  it('UTF-8 파일명이 없으면 quoted 파일명을 사용한다', () => {
    expect(
      getFilenameFromContentDisposition('attachment; filename="my \\"cv\\".pdf"', 'fallback.pdf'),
    ).toBe('my "cv".pdf');
  });

  it('헤더가 없거나 파일명이 없으면 폴백을 사용한다', () => {
    expect(getFilenameFromContentDisposition(null, 'fallback.pdf')).toBe('fallback.pdf');
    expect(getFilenameFromContentDisposition('attachment', 'fallback.pdf')).toBe('fallback.pdf');
  });
});
