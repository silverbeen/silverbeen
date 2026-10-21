'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** 본문(article) 안에서 rehype-slug가 id를 부여한 h1~h3 */
export const HEADING_SELECTOR = 'article h1[id], article h2[id], article h3[id]';

/**
 * heading 요소 목록을 TOC 항목으로 변환 (rehype-slug가 생성한 실제 id 사용)
 */
export function toTocItems(elements: Iterable<Element>): TocItem[] {
  return Array.from(elements, (el) => ({
    id: el.id,
    text: el.textContent?.trim() ?? '',
    level: Number(el.tagName.charAt(1)) || 1,
  }));
}

const EMPTY: TocItem[] = [];
let cache: { key: string; items: TocItem[] } = { key: '', items: EMPTY };

function getSnapshot(): TocItem[] {
  const items = toTocItems(document.querySelectorAll(HEADING_SELECTOR));
  const key = items.map((item) => `${item.level}|${item.id}|${item.text}`).join('\n');
  // 내용이 같으면 동일 참조를 반환해야 useSyncExternalStore가 무한 렌더링하지 않음
  if (key !== cache.key) {
    cache = { key, items: items.length ? items : EMPTY };
  }
  return cache.items;
}

function getServerSnapshot(): TocItem[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

/**
 * 렌더링된 DOM에서 목차(heading) 목록을 읽음.
 * 데스크톱 TOC와 모바일 TOC가 같은 소스를 공유해 id 불일치가 없음
 */
export function useHeadings(): TocItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 현재 화면에 보이는 heading id 추적
 * @param headings - 관찰할 heading 목록
 * @param topOffset - 상단 고정 헤더 높이(px)
 */
export function useActiveHeading(headings: TocItem[], topOffset: number): string {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: `-${topOffset}px 0px -80% 0px`, threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, topOffset]);

  return activeId;
}

/**
 * 고정 헤더 높이만큼 여백을 두고 heading으로 부드럽게 스크롤
 */
export function scrollToHeading(id: string, offset: number): void {
  const element = document.getElementById(id);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
