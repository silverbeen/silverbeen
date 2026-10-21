import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PostListResponse } from '@silverbeen/types';

const getList = vi.fn<(params?: { page?: number; limit?: number }) => Promise<PostListResponse>>();
vi.mock('@/lib/api', () => ({
  api: { blogs: { getList: (params?: { page?: number; limit?: number }) => getList(params) } },
}));
vi.mock('@/config', () => ({ config: { siteUrl: 'https://example.com' } }));

import sitemap from './sitemap';

function page(slugs: string[], pageNum: number, totalPages: number): PostListResponse {
  return {
    posts: slugs.map((slug, i) => ({
      id: i,
      slug,
      updatedAt: '2026-01-01T00:00:00.000Z',
    })) as PostListResponse['posts'],
    total: slugs.length,
    page: pageNum,
    totalPages,
  };
}

const blogUrls = (entries: Awaited<ReturnType<typeof sitemap>>) =>
  entries.map((e) => e.url).filter((url) => url.includes('/blog/'));

describe('sitemap', () => {
  beforeEach(() => {
    getList.mockReset();
  });

  it('API limit 상한(100) 이하로 요청하고 모든 페이지의 글을 포함한다', async () => {
    getList.mockImplementation(async (params) => {
      const p = params?.page ?? 1;
      return page([`post-${p}-a`, `post-${p}-b`], p, 3);
    });

    const entries = await sitemap();

    expect(getList).toHaveBeenCalledTimes(3);
    for (const [params] of getList.mock.calls) {
      expect(params?.limit).toBeLessThanOrEqual(100);
    }
    expect(blogUrls(entries)).toEqual([
      'https://example.com/blog/post-1-a',
      'https://example.com/blog/post-1-b',
      'https://example.com/blog/post-2-a',
      'https://example.com/blog/post-2-b',
      'https://example.com/blog/post-3-a',
      'https://example.com/blog/post-3-b',
    ]);
  });

  it('글이 없으면 첫 페이지만 요청한다', async () => {
    getList.mockResolvedValue(page([], 1, 0));

    const entries = await sitemap();

    expect(getList).toHaveBeenCalledTimes(1);
    expect(blogUrls(entries)).toEqual([]);
    expect(entries).toHaveLength(4);
  });

  it('API 에러 시 정적 페이지만 반환한다', async () => {
    getList.mockRejectedValue(new Error('API down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const entries = await sitemap();

    expect(blogUrls(entries)).toEqual([]);
    expect(entries).toHaveLength(4);
  });
});
