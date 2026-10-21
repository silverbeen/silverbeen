import { describe, it, expect } from 'vitest';
import { parseBlogQuery, buildBlogQueryString, DEFAULT_BLOG_QUERY } from './blogQuery';

describe('parseBlogQuery', () => {
  it('빈 쿼리는 기본값', () => {
    expect(parseBlogQuery({})).toEqual(DEFAULT_BLOG_QUERY);
  });

  it('유효한 값을 파싱한다 (likeCount 정렬 포함)', () => {
    expect(
      parseBlogQuery({ tag: 'react', page: '3', sortBy: 'likeCount', order: 'asc', search: ' next ' }),
    ).toEqual({ tag: 'react', page: 3, sortBy: 'likeCount', order: 'asc', search: 'next' });
  });

  it('잘못된 값은 기본값으로 대체한다', () => {
    expect(parseBlogQuery({ page: '-1', sortBy: 'hacked', order: 'up' })).toEqual(DEFAULT_BLOG_QUERY);
    expect(parseBlogQuery({ page: 'abc' }).page).toBe(1);
  });

  it('배열 파라미터는 첫 번째 값 사용', () => {
    expect(parseBlogQuery({ tag: ['a', 'b'] }).tag).toBe('a');
  });
});

describe('buildBlogQueryString', () => {
  it('기본값은 생략한다', () => {
    expect(buildBlogQueryString(DEFAULT_BLOG_QUERY)).toBe('');
  });

  it('parse와 왕복 변환된다', () => {
    const query = { tag: 'C++', page: 2, sortBy: 'likeCount', order: 'desc', search: '검색어' } as const;
    const qs = buildBlogQueryString(query);
    expect(qs).toBe('?tag=C%2B%2B&page=2&sortBy=likeCount&search=%EA%B2%80%EC%83%89%EC%96%B4');
    expect(parseBlogQuery(Object.fromEntries(new URLSearchParams(qs)))).toEqual(query);
  });
});
