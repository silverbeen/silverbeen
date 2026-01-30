'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/supabase/storage';
import {
  optimizeImage,
  revokePreview,
  type OptimizedImage,
} from '@/lib/image';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder?: string;
  title?: string;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onSelect,
  folder = 'images',
  title = '이미지 업로드',
}: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<OptimizedImage | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setError(null);
    try {
      const optimized = await optimizeImage(file);
      setPreview(optimized);
    } catch {
      setError('이미지 처리 중 오류가 발생했습니다.');
    }
  }, []);

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      const result = await uploadImage(preview.file, folder, { optimize: false });
      onSelect(result.url);
      handleClose();
    } catch {
      setError('업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (preview) {
      revokePreview(preview.preview);
    }
    setPreview(null);
    setError(null);
    setDragOver(false);
    onClose();
  };

  const handleReset = () => {
    if (preview) {
      revokePreview(preview.preview);
    }
    setPreview(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-4">
          {preview ? (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={preview.preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>압축률: {preview.compressionRatio}%</span>
                <span>
                  {(preview.originalSize / 1024).toFixed(0)}KB →{' '}
                  {(preview.optimizedSize / 1024).toFixed(0)}KB
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  다시 선택
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    '업로드'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() =>
                document.getElementById('modal-file-input')?.click()
              }
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${
                  dragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }
              `}
            >
              <input
                id="modal-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                클릭하거나 이미지를 드래그하세요
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                자동으로 WebP 변환 및 최적화됩니다
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
