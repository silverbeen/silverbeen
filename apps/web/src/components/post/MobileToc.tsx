'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TocItem {
  id: string;
  text: string;
  level: number;
}



export function MobileTocButton({
  isOpen,
  onClick,
  hasHeadings,
}: {
  isOpen: boolean;
  onClick: () => void;
  hasHeadings: boolean;
}) {
  if (!hasHeadings) return null;

  return (
    <button
      onClick={onClick}
      className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-1 text-gray-400 transition-colors dark:text-gray-500 xl:hidden"
      aria-label="목차 열기"
    >
      <ChevronDown
        className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

export function MobileTocPanel({
  isOpen,
  onClose,
}: { isOpen: boolean; onClose: () => void }) {
  const [activeId, setActiveId] = useState<string>('');
  const [headings, setHeadings] = useState<TocItem[]>([]);

  // DOM에서 실제 heading 요소를 가져옴 (rehype-slug가 생성한 ID 사용)
  useEffect(() => {
    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
    const items: TocItem[] = [];

    headingElements.forEach((el) => {
      const level = parseInt(el.tagName[1], 10);
      items.push({
        id: el.id,
        text: el.textContent || '',
        level,
      });
    });

    setHeadings(items);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-120px 0px -80% 0px',
        threshold: 0,
      }
    );

    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  const handleClick = (id: string) => {
    // 먼저 패널을 닫음
    onClose();

    // 약간의 딜레이 후 스크롤 (애니메이션이 끝난 후)
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  if (headings.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden border-t border-gray-200/80 bg-gray-50/95 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/95 xl:hidden"
        >
          <div className="mx-auto max-w-4xl px-6 py-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">목차</h4>
            <ul className="space-y-2">
              {headings.map((heading, index) => (
                <li
                  key={`${heading.id}-${index}`}
                  style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
                >
                  <button
                    onClick={() => handleClick(heading.id)}
                    className={`w-full cursor-pointer text-left text-sm leading-relaxed transition-colors duration-200 hover:text-primary-500 ${
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useMobileToc() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasHeadings, setHasHeadings] = useState(false);

  useEffect(() => {
    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
    setHasHeadings(headingElements.length > 0);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    close,
    hasHeadings,
  };
}
