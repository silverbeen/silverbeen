'use client';

import { useEffect } from 'react';

export function CodeBlockCopy() {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.prose pre');

      codeBlocks.forEach((pre, index) => {
        // 이미 버튼이 있으면 스킵
        if (pre.querySelector('.copy-code-button')) return;

        // pre 요소를 relative로 설정
        (pre as HTMLElement).style.position = 'relative';

        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.setAttribute('data-index', index.toString());
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

        button.addEventListener('click', async () => {
          const code = pre.querySelector('code');
          if (code) {
            const text = code.textContent || '';
            await navigator.clipboard.writeText(text);

            const copyIcon = button.querySelector('.copy-icon');
            const checkIcon = button.querySelector('.check-icon');
            copyIcon?.classList.add('hidden');
            checkIcon?.classList.remove('hidden');

            setTimeout(() => {
              copyIcon?.classList.remove('hidden');
              checkIcon?.classList.add('hidden');
            }, 2000);
          }
        });

        pre.appendChild(button);
      });
    };

    // 초기 실행 및 DOM 변경 감지
    addCopyButtons();

    const observer = new MutationObserver(addCopyButtons);
    const proseElement = document.querySelector('.prose');
    if (proseElement) {
      observer.observe(proseElement, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
