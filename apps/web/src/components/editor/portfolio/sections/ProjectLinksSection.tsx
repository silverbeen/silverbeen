'use client';

import type { PortfolioProject } from '@/types/portfolio';
import { SortableLinkItem } from '../SortableItems';
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
import { Plus, Link as LinkIcon } from 'lucide-react';

interface ProjectLinksSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectLinksSection({
  project,
  onChange,
}: ProjectLinksSectionProps) {
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

  const handleAddLink = () => {
    onChange('links', [...(project.links || []), { label: '', url: '' }]);
  };

  const handleUpdateLink = (
    index: number,
    updated: { label: string; url: string }
  ) => {
    const newLinks = [...(project.links || [])];
    newLinks[index] = updated;
    onChange('links', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    onChange(
      'links',
      (project.links || []).filter((_, i) => i !== index)
    );
  };

  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const links = project.links || [];
      const oldIndex = links.findIndex((_, i) => `link-${i}` === active.id);
      const newIndex = links.findIndex((_, i) => `link-${i}` === over.id);
      onChange('links', arrayMove(links, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-primary-500" />
            링크
          </h5>
          {(project.links || []).length > 1 && (
            <span className="text-xs text-gray-400">
              드래그하여 순서 변경
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddLink}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          링크 추가
        </button>
      </div>
      {(project.links || []).length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
          GitHub, 배포 URL 등 관련 링크를 추가해주세요
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleLinkDragEnd}
        >
          <SortableContext
            items={(project.links || []).map((_, i) => `link-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {(project.links || []).map((link, index) => (
                <SortableLinkItem
                  key={`link-${index}`}
                  id={`link-${index}`}
                  link={link}
                  onUpdate={(updated) => handleUpdateLink(index, updated)}
                  onRemove={() => handleRemoveLink(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
