'use client';

import { useEffect, useRef } from 'react';

/**
 * 열린 모달 스택. 중첩 모달(예: 프로젝트 상세 → 이미지 미리보기)에서
 * 가장 위의 모달만 키보드 이벤트를 처리하도록 하기 위해 사용
 */
const modalStack: symbol[] = [];

export function pushModal(id: symbol): void {
  modalStack.push(id);
}

export function removeModal(id: symbol): void {
  const index = modalStack.lastIndexOf(id);
  if (index !== -1) modalStack.splice(index, 1);
}

export function isTopModal(id: symbol): boolean {
  return modalStack[modalStack.length - 1] === id;
}

/**
 * body 스크롤 잠금 (참조 카운트). 마지막 잠금이 해제될 때만 원래 overflow로 복원
 */
let scrollLockCount = 0;
let originalBodyOverflow = '';

export function lockBodyScroll(): () => void {
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
    }
  };
}

interface UseModalBehaviorOptions {
  /** 가장 위의 모달일 때만 호출되는 keydown 핸들러 */
  onKeyDown?: (event: KeyboardEvent) => void;
  /** body 스크롤 잠금 여부 (기본 true) */
  lockScroll?: boolean;
}

/**
 * 모달 공통 동작: 중첩을 고려한 키보드 처리 + 참조 카운트 스크롤 잠금
 */
export function useModalBehavior(
  isOpen: boolean,
  { onKeyDown, lockScroll = true }: UseModalBehaviorOptions = {},
) {
  const onKeyDownRef = useRef(onKeyDown);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  });

  useEffect(() => {
    if (!isOpen) return;

    const id = Symbol('modal');
    pushModal(id);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal(id)) return;
      onKeyDownRef.current?.(event);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      removeModal(id);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    return lockBodyScroll();
  }, [isOpen, lockScroll]);
}
