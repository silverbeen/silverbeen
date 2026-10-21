'use client';

import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModalBehavior } from '@/hooks/useModalBehavior';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** 접근성 라벨 / alt 텍스트에 사용 */
  projectName: string;
}

// 스와이프 임계값
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;
const EDGE_RESISTANCE_FACTOR = 0.3;

const noopSubscribe = () => () => {};

/** 클라이언트에서만 true (portal 대상 document.body 접근용) */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * 이미지 미리보기 모달 (키보드 ←/→/Esc, 모바일 스와이프 지원).
 * 다른 모달 위에 열려도 가장 위의 모달만 키 입력을 처리하고, 스크롤 잠금은 참조 카운트로 관리
 */
export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
  projectName,
}: ImageModalProps) {
  const isClient = useIsClient();

  useModalBehavior(isOpen, {
    onKeyDown: (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
  });

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${projectName} 이미지 미리보기`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons - hidden on mobile */}
          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                aria-label="이전 이미지"
                className="absolute left-4 z-10 hidden rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:block"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={onNext}
                aria-label="다음 이미지"
                className="absolute right-4 z-10 hidden rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:block"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* 모달이 열릴 때마다 새로 마운트되어 스와이프 상태가 초기화됨 */}
          <SwipeableImage
            images={images}
            currentIndex={currentIndex}
            onPrev={onPrev}
            onNext={onNext}
            projectName={projectName}
          />

          {/* Image Counter and Swipe Hint */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
              {/* Mobile swipe hint */}
              <span className="block text-xs text-white/60 md:hidden">
                좌우로 스와이프하여 이미지 전환
              </span>
              {/* Image counter */}
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface SwipeableImageProps {
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  projectName: string;
}

function SwipeableImage({
  images,
  currentIndex,
  onPrev,
  onNext,
  projectName,
}: SwipeableImageProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartTime = useRef<number>(0);

  const resetSwipeState = useCallback(() => {
    setSwipeOffset(0);
    setIsSwiping(false);
    setTouchStart(null);
    setTouchEnd(null);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    touchStartTime.current = Date.now();
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // 가장자리 저항감 적용 (첫/마지막 이미지에서 실제 이동의 30%만 반영)
    const isAtStart = currentIndex === 0 && diff > 0;
    const isAtEnd = currentIndex === images.length - 1 && diff < 0;
    setSwipeOffset(isAtStart || isAtEnd ? diff * EDGE_RESISTANCE_FACTOR : diff);
    setTouchEnd(currentTouch);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      resetSwipeState();
      return;
    }

    const distance = touchStart - touchEnd;
    const duration = Date.now() - touchStartTime.current;
    const velocity = Math.abs(distance) / duration;

    const isSwipeLeft =
      distance > SWIPE_THRESHOLD || (distance > 0 && velocity > VELOCITY_THRESHOLD);
    const isSwipeRight =
      distance < -SWIPE_THRESHOLD || (distance < 0 && velocity > VELOCITY_THRESHOLD);

    if (isSwipeLeft && currentIndex < images.length - 1) {
      onNext();
    } else if (isSwipeRight && currentIndex > 0) {
      onPrev();
    }

    resetSwipeState();
  };

  return (
    <motion.div
      className="relative z-10 mx-4 max-h-[90vh] w-[90vw] min-w-[50vw] touch-pan-y overflow-hidden rounded-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: swipeOffset }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{
        duration: 0.2,
        x: { duration: isSwiping ? 0 : 0.3, ease: 'easeOut' },
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
          className="relative flex items-center justify-center"
        >
          <Image
            src={images[currentIndex]}
            alt={`${projectName} screenshot ${currentIndex + 1}`}
            width={1920}
            height={1080}
            className="pointer-events-none h-auto max-h-[90vh] w-full object-contain select-none"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
