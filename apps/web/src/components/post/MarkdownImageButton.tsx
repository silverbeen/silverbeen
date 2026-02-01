'use client';

import { useRef } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

interface MarkdownImageButtonProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
}

export function MarkdownImageButton({
  onFileSelect,
  uploading,
}: MarkdownImageButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input for re-selecting same file
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 transition-colors"
        title="이미지 삽입 (드래그앤드롭, Ctrl+V도 가능)"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </button>
    </>
  );
}
