'use client';

import { useHeadings, useActiveHeading, scrollToHeading } from '@/hooks/useHeadings';

const HEADER_OFFSET = 80;

/** heading 레벨별 들여쓰기 (h1: 0, h2: 12px, h3: 24px) */
const INDENT_CLASS: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-3',
  3: 'pl-6',
};

export function TableOfContents() {
  const headings = useHeadings();
  const activeId = useActiveHeading(headings, HEADER_OFFSET);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="custom-scrollbar sticky top-24 hidden max-h-[calc(100vh-30rem)] w-64 overflow-y-auto xl:block">
      <div className="border-l-2 border-gray-200 pl-4 dark:border-gray-700">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">목차</h4>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} className={INDENT_CLASS[heading.level] ?? 'pl-6'}>
              <button
                onClick={() => scrollToHeading(heading.id, HEADER_OFFSET)}
                className={`hover:text-primary-500 cursor-pointer text-left text-sm leading-relaxed transition-colors duration-200 ${
                  activeId === heading.id
                    ? 'text-primary-500 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
