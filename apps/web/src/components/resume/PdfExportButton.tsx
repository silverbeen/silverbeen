"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export function PdfExportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExport = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProgress(10);
    setError(null);

    try {
      setProgress(20);

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PDF API 에러:", errorData);
        throw new Error(errorData.error || "PDF 생성 실패");
      }

      const blob = await response.blob();
      setProgress(90);

      // 다운로드 - Content-Disposition 헤더에서 동적 파일명 추출
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/);
      link.download = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (err) {
      console.error("PDF 생성 중 오류:", err);
      const message = err instanceof Error ? err.message : "PDF 생성에 실패했습니다";
      setError(message);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  // 로그인하지 않은 사용자에게는 버튼을 숨김
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* 플로팅 PDF 내보내기 버튼 (로그인 사용자만) */}
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

      {/* 에러 토스트 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg dark:border-red-800 dark:bg-red-950"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="ml-2 rounded p-1 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
