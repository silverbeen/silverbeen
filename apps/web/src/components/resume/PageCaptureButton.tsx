"use client";

import { Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageCapturePdf } from "@/hooks/usePageCapturePdf";

export function PageCaptureButton() {
  const { isGenerating, progress, capturePdf } = usePageCapturePdf({
    selector: "#resume-content",
  });

  return (
    <>
      {/* 페이지 캡처 버튼 */}
      <motion.button
        onClick={capturePdf}
        disabled={isGenerating}
        className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground shadow-lg transition-all hover:bg-secondary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>캡처 중... {progress}%</span>
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            <span>페이지 캡처</span>
          </>
        )}
      </motion.button>

      {/* 프로그레스 바 (생성 중일 때만 표시) */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-2xl bg-background p-8 shadow-2xl"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium text-foreground">페이지 캡처 중...</p>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}% 완료</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
