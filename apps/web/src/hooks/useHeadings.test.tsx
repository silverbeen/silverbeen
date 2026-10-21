import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { HEADING_SELECTOR, toTocItems, useHeadings } from './useHeadings';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('toTocItems', () => {
  it('DOM heading의 실제 id/레벨/텍스트를 사용한다 (rehype-slug 중복 id 포함)', () => {
    document.body.innerHTML = `
      <h1 id="outside">본문 밖</h1>
      <article>
        <h1>제목 (id 없음)</h1>
        <h2 id="intro">소개</h2>
        <h2 id="intro-1">소개</h2>
        <pre><code># 코드 블록 주석</code></pre>
        <h3 id="c">  C# 사용법 </h3>
        <h4 id="deep">h4는 제외</h4>
      </article>`;

    expect(toTocItems(document.querySelectorAll(HEADING_SELECTOR))).toEqual([
      { id: 'intro', text: '소개', level: 2 },
      { id: 'intro-1', text: '소개', level: 2 },
      { id: 'c', text: 'C# 사용법', level: 3 },
    ]);
  });
});

describe('useHeadings', () => {
  it('렌더된 heading을 읽고 DOM 변경을 반영한다', async () => {
    document.body.innerHTML = '<article><h2 id="a">A</h2></article>';
    const { result, unmount } = renderHook(() => useHeadings());
    expect(result.current.map((h) => h.id)).toEqual(['a']);

    const first = result.current;
    await act(async () => {
      const h3 = document.createElement('h3');
      h3.id = 'b';
      h3.textContent = 'B';
      document.querySelector('article')!.appendChild(h3);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.map((h) => h.id)).toEqual(['a', 'b']);
    expect(result.current).not.toBe(first);
    unmount();
  });
});
