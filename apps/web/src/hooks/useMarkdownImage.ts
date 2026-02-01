'use client';

import { useCallback, useEffect, useState } from 'react';
import { uploadImage } from '@/lib/supabase/storage';

interface UseMarkdownImageOptions {
  onInsert: (markdown: string) => void;
  onError?: (error: Error) => void;
  folder?: string;
}

interface UseMarkdownImageReturn {
  uploading: boolean;
  handleFileUpload: (file: File) => Promise<void>;
  bindDropEvents: (element: HTMLElement | null) => void;
  bindPasteEvents: (element: HTMLElement | null) => void;
}

export function useMarkdownImage({
  onInsert,
  onError,
  folder = 'posts',
}: UseMarkdownImageOptions): UseMarkdownImageReturn {
  const [uploading, setUploading] = useState(false);
  // element를 상태로 관리하여 ref 변경 시 리스너 재바인딩
  const [dropElement, setDropElement] = useState<HTMLElement | null>(null);
  const [pasteElement, setPasteElement] = useState<HTMLElement | null>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;

      setUploading(true);
      try {
        const result = await uploadImage(file, folder);
        const altText = file.name.replace(/\.[^.]+$/, '');
        onInsert(`![${altText}](${result.url})\n`);
      } catch (error) {
        console.error('Image upload failed:', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setUploading(false);
      }
    },
    [onInsert, onError, folder]
  );

  // 드래그앤드롭 이벤트 바인딩
  const bindDropEvents = useCallback((element: HTMLElement | null) => {
    setDropElement(element);
  }, []);

  useEffect(() => {
    if (!dropElement) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (file?.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    dropElement.addEventListener('drop', handleDrop);
    dropElement.addEventListener('dragover', handleDragOver);

    return () => {
      dropElement.removeEventListener('drop', handleDrop);
      dropElement.removeEventListener('dragover', handleDragOver);
    };
  }, [dropElement, handleFileUpload]);

  // 클립보드 붙여넣기 이벤트 바인딩
  const bindPasteEvents = useCallback((element: HTMLElement | null) => {
    setPasteElement(element);
  }, []);

  useEffect(() => {
    if (!pasteElement) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileUpload(file);
          }
          break;
        }
      }
    };

    pasteElement.addEventListener('paste', handlePaste);
    return () => pasteElement.removeEventListener('paste', handlePaste);
  }, [pasteElement, handleFileUpload]);

  return {
    uploading,
    handleFileUpload,
    bindDropEvents,
    bindPasteEvents,
  };
}
