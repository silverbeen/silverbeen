'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const dropRef = useRef<HTMLElement | null>(null);
  const pasteRef = useRef<HTMLElement | null>(null);

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
    [onInsert, folder]
  );

  // 드래그앤드롭 이벤트 바인딩
  const bindDropEvents = useCallback(
    (element: HTMLElement | null) => {
      dropRef.current = element;
    },
    []
  );

  useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

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

    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragover', handleDragOver);

    return () => {
      element.removeEventListener('drop', handleDrop);
      element.removeEventListener('dragover', handleDragOver);
    };
  }, [handleFileUpload]);

  // 클립보드 붙여넣기 이벤트 바인딩
  const bindPasteEvents = useCallback(
    (element: HTMLElement | null) => {
      pasteRef.current = element;
    },
    []
  );

  useEffect(() => {
    const element = pasteRef.current;
    if (!element) return;

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

    element.addEventListener('paste', handlePaste);
    return () => element.removeEventListener('paste', handlePaste);
  }, [handleFileUpload]);

  return {
    uploading,
    handleFileUpload,
    bindDropEvents,
    bindPasteEvents,
  };
}
