'use client';

import { useCallback, useState } from 'react';

/** 이전 인덱스 (처음에서 이전이면 마지막으로 순환) */
export function getPrevIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return index <= 0 ? length - 1 : index - 1;
}

/** 다음 인덱스 (마지막에서 다음이면 처음으로 순환) */
export function getNextIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return index >= length - 1 ? 0 : index + 1;
}

/**
 * 이미지 갤러리 + 미리보기 모달 상태 (열기/닫기, 순환 이전/다음)
 */
export function useImageGallery(length: number) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const prev = useCallback(() => {
    setCurrentIndex((index) => getPrevIndex(index, length));
  }, [length]);

  const next = useCallback(() => {
    setCurrentIndex((index) => getNextIndex(index, length));
  }, [length]);

  return {
    isOpen,
    // 이미지가 삭제되어 범위를 벗어난 경우 보정
    currentIndex: Math.min(currentIndex, Math.max(length - 1, 0)),
    open,
    close,
    prev,
    next,
  };
}
