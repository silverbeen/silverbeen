"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  projectName: string;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
  }>;
}

function DefaultImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  return <img src={src} alt={alt} className={className} />;
}

export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
  projectName,
  ImageComponent = DefaultImage,
}: ImageModalProps) {
  const [mounted, setMounted] = useState(false);

  // 스와이프 관련 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartTime = useRef<number>(0);

  // 스와이프 임계값
  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 0.3;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 스와이프 종료 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSwipeOffset(0);
      setIsSwiping(false);
      setTouchStart(null);
      setTouchEnd(null);
    }
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    touchStartTime.current = Date.now();
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // 가장자리 저항감 적용 (첫/마지막 이미지에서)
    const isAtStart = currentIndex === 0 && diff > 0;
    const isAtEnd = currentIndex === images.length - 1 && diff < 0;

    if (isAtStart || isAtEnd) {
      // 저항감: 실제 이동의 30%만 반영
      setSwipeOffset(diff * 0.3);
    } else {
      setSwipeOffset(diff);
    }

    setTouchEnd(currentTouch);
  }, [touchStart, currentIndex, images.length]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const duration = Date.now() - touchStartTime.current;
    const velocity = Math.abs(distance) / duration;

    const isSwipeLeft = distance > SWIPE_THRESHOLD || (distance > 0 && velocity > VELOCITY_THRESHOLD);
    const isSwipeRight = distance < -SWIPE_THRESHOLD || (distance < 0 && velocity > VELOCITY_THRESHOLD);

    if (isSwipeLeft && currentIndex < images.length - 1) {
      onNext();
    } else if (isSwipeRight && currentIndex > 0) {
      onPrev();
    }

    setIsSwiping(false);
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, images.length, onNext, onPrev]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
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

          {/* Image Container with touch handlers */}
          <motion.div
            className="relative z-10 mx-4 w-[90vw] min-w-[50vw] max-h-[90vh] overflow-hidden rounded-lg touch-pan-y"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
              transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
            }}
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
                <ImageComponent
                  src={images[currentIndex]}
                  alt={`${projectName} screenshot ${currentIndex + 1}`}
                  width={1920}
                  height={1080}
                  className="h-auto max-h-[90vh] w-full object-contain pointer-events-none select-none"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Image Counter and Swipe Hint */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
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
    document.body
  );
}
