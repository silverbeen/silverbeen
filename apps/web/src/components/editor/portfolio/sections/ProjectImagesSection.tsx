'use client';

import { useState } from 'react';
import type { PortfolioProject } from '@/types/portfolio';
import { ImageUploadModal } from '@/components/ui';
import { SortableImageItem } from '../SortableItems';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Image as ImageIcon } from 'lucide-react';

interface ProjectImagesSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectImagesSection({
  project,
  onChange,
}: ProjectImagesSectionProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddImage = (url: string) => {
    onChange('images', [...(project.images || []), url]);
  };

  const handleRemoveImage = (index: number) => {
    onChange(
      'images',
      (project.images || []).filter((_, i) => i !== index)
    );
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const images = project.images || [];
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);
      onChange('images', arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary-500" />
            이미지
          </h5>
          {(project.images || []).length > 1 && (
            <span className="text-xs text-gray-400">
              드래그하여 순서 변경
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          이미지 추가
        </button>
      </div>
      {project.images && project.images.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleImageDragEnd}
        >
          <SortableContext
            items={(project.images || []).map((_, i) => `image-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {project.images.map((url, index) => (
                <SortableImageItem
                  key={`image-${index}`}
                  id={`image-${index}`}
                  url={url}
                  index={index}
                  onRemove={() => handleRemoveImage(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
          이미지를 추가해주세요
        </p>
      )}

      <ImageUploadModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleAddImage}
        folder="portfolio"
        title="포트폴리오 이미지 업로드"
      />
    </div>
  );
}
