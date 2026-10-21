'use client';

import { useMemo, useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { ImageUploadModal } from '@/components/ui';
import { ImageModal } from '@/components/ui/ImageModal';
import { useDndSensors } from '@/hooks/useDndSensors';
import { useImageGallery } from '@/hooks/useImageGallery';
import { generateImageIds } from './utils';

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  onPreview: () => void;
}

function SortableImageItem({ id, url, index, onRemove, onPreview }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // dnd-kit 동적 transform/transition은 인라인 스타일 허용
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 ${
        isDragging ? 'z-50 opacity-50 shadow-lg' : ''
      }`}
    >
      {/* 에디터 썸네일은 임의 URL일 수 있어 next/image 대신 img 사용 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`이미지 ${index + 1}`}
        className="h-24 w-24 cursor-pointer object-cover"
        onClick={onPreview}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          aria-label="드래그하여 순서 변경"
          className="pointer-events-auto cursor-grab rounded-lg bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="이미지 삭제"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="pointer-events-auto rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface SortableImageListProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Supabase Storage 업로드 폴더 */
  folder: string;
  /** 업로드 모달 제목 */
  uploadTitle: string;
  /** 미리보기 모달 접근성 라벨 (예: 프로젝트명) */
  previewLabel: string;
  className?: string;
}

/**
 * 이미지 업로드 + 드래그 정렬 + 클릭 미리보기(ImageModal) 필드
 */
export function SortableImageList({
  images,
  onChange,
  folder,
  uploadTitle,
  previewLabel,
  className = '',
}: SortableImageListProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const sensors = useDndSensors();
  const gallery = useImageGallery(images.length);
  // URL 기반 ID라 순서 변경/삭제 시에도 안정적
  const imageIds = useMemo(() => generateImageIds(images), [images]);

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = imageIds.indexOf(String(active.id));
    const newIndex = imageIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <ImageIcon className="text-primary-500 h-4 w-4" />
            이미지
          </h5>
          {images.length > 1 && <span className="text-xs text-gray-400">드래그하여 순서 변경</span>}
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          이미지 추가
        </button>
      </div>

      {images.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={imageIds} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-3">
              {images.map((url, index) => (
                <SortableImageItem
                  key={imageIds[index]}
                  id={imageIds[index]}
                  url={url}
                  index={index}
                  onRemove={() => handleRemove(index)}
                  onPreview={() => gallery.open(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="rounded-xl border-2 border-dashed border-gray-200 py-4 text-center text-sm text-gray-400 dark:border-gray-600">
          이미지를 추가해주세요
        </p>
      )}

      <ImageUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSelect={(url) => onChange([...images, url])}
        folder={folder}
        title={uploadTitle}
      />

      {images.length > 0 && (
        <ImageModal
          images={images}
          currentIndex={gallery.currentIndex}
          isOpen={gallery.isOpen}
          onClose={gallery.close}
          onPrev={gallery.prev}
          onNext={gallery.next}
          projectName={previewLabel}
        />
      )}
    </div>
  );
}
