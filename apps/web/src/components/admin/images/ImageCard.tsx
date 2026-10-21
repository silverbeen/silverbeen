'use client';

import { Check, Copy, Trash2 } from 'lucide-react';
import type { StoredImage } from '@/lib/supabase/storage';
import { getFolderLabel } from './constants';

interface ImageCardProps {
  image: StoredImage;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: (path: string) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (image: StoredImage) => void;
}

export function ImageCard({
  image,
  selectionMode,
  selected,
  onToggleSelect,
  onCopyUrl,
  onDelete,
}: ImageCardProps) {
  const selectionProps = selectionMode
    ? {
        onClick: () => onToggleSelect(image.path),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleSelect(image.path);
          }
        },
        role: 'button',
        tabIndex: 0,
        'aria-pressed': selected,
        'aria-label': `${image.name} ${selected ? '선택됨' : '선택 안됨'}`,
      }
    : {};

  return (
    <div
      {...selectionProps}
      className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors dark:bg-gray-800 ${
        selected
          ? 'border-primary-500 ring-primary-500/30 ring-2'
          : 'border-gray-200 dark:border-gray-700'
      } ${selectionMode ? 'focus:ring-primary-500 cursor-pointer focus:ring-2 focus:outline-none' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원본 미리보기 (도메인/크기 가변) */}
      <img src={image.url} alt={image.name} className="h-full w-full object-cover" loading="lazy" />

      {selectionMode ? (
        <div
          className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white/80'
          }`}
        >
          {selected && <Check className="h-4 w-4 text-white" />}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onCopyUrl(image.url)}
            className="rounded-lg bg-white p-2 transition-colors hover:bg-gray-100"
            title="URL 복사"
          >
            <Copy className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => onDelete(image)}
            className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
            title="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate text-xs text-white">{image.name}</p>
        <p className="text-xs text-gray-300">{getFolderLabel(image.folder)}</p>
      </div>
    </div>
  );
}
