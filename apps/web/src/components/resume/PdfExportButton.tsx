"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumePdf } from "@/hooks/useResumePdf";
import { ResumePdfContent } from "./ResumePdfContent";
import type { ResumeData } from "@/types/resume";

interface PdfExportButtonProps {
  data: ResumeData;
}

export function PdfExportButton({ data }: PdfExportButtonProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { isGenerating, progress, generatePdf } = useResumePdf();
  const [showPdfContent, setShowPdfContent] = useState(false);

  const handleExport = async () => {
    // PDF 컨텐츠를 먼저 렌더링
    setShowPdfContent(true);

    // DOM이 업데이트되고 이미지가 로드될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 이미지 로딩 대기
    if (pdfContentRef.current) {
      const images = pdfContentRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
              }
            })
        )
      );
    }

    try {
      await generatePdf(pdfContentRef);
    } finally {
      // PDF 생성 완료 후 숨김
      setTimeout(() => setShowPdfContent(false), 500);
    }
  };

  return (
    <>
      {/* 플로팅 PDF 내보내기 버튼 */}
      <motion.button
        onClick={handleExport}
        disabled={isGenerating}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>PDF 생성 중... {progress}%</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>PDF 다운로드</span>
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
              <p className="text-lg font-medium text-foreground">PDF 생성 중...</p>
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

      {/* PDF 렌더링 영역 - 화면 밖에 위치시켜 실제 렌더링되도록 함 */}
      {showPdfContent && (
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "800px",
          }}
          aria-hidden="true"
        >
          <ResumePdfContent ref={pdfContentRef} data={data} />
        </div>
      )}
    </>
  );
}
