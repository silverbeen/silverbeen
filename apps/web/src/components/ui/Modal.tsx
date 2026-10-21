'use client';

import { useId, type ReactNode } from 'react';
import { useModalBehavior } from '@/hooks/useModalBehavior';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** 하단 버튼 영역 */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * 범용 모달 다이얼로그 (오버레이 클릭 / ESC로 닫힘)
 */
export function Modal({ isOpen, onClose, title, footer, children, className = '' }: ModalProps) {
  const titleId = useId();

  // ESC 닫기(중첩 모달은 최상단만) + body 스크롤 잠금
  useModalBehavior(isOpen, {
    onKeyDown: (e) => {
      if (e.key === 'Escape') onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative z-50 mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 ${className}`}
      >
        {title && (
          <h3 id={titleId} className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {children}
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
