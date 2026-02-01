'use client';

import type { PortfolioProject, GrowthExperience } from '@/types/portfolio';
import { SortableGrowthItem } from '../SortableItems';
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
import { Plus, Sparkles } from 'lucide-react';

interface ProjectGrowthSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectGrowthSection({
  project,
  onChange,
}: ProjectGrowthSectionProps) {
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

  const handleAddGrowth = () => {
    const newGrowth: GrowthExperience = { title: '', content: '' };
    onChange('growthExperience', [
      ...(project.growthExperience || []),
      newGrowth,
    ]);
  };

  const handleUpdateGrowth = (index: number, growth: GrowthExperience) => {
    const newGrowths = [...(project.growthExperience || [])];
    newGrowths[index] = growth;
    onChange('growthExperience', newGrowths);
  };

  const handleRemoveGrowth = (index: number) => {
    onChange(
      'growthExperience',
      (project.growthExperience || []).filter((_, i) => i !== index)
    );
  };

  const handleGrowthDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const growths = project.growthExperience || [];
      const oldIndex = growths.findIndex(
        (_, i) => `growth-${i}` === active.id
      );
      const newIndex = growths.findIndex((_, i) => `growth-${i}` === over.id);
      onChange('growthExperience', arrayMove(growths, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            성장 경험
          </h5>
          {(project.growthExperience || []).length > 1 && (
            <span className="text-xs text-gray-400">
              드래그하여 순서 변경
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddGrowth}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>
      {(project.growthExperience || []).length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
          성장 경험을 추가해주세요
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGrowthDragEnd}
        >
          <SortableContext
            items={(project.growthExperience || []).map(
              (_, i) => `growth-${i}`
            )}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {(project.growthExperience || []).map((growth, index) => (
                <SortableGrowthItem
                  key={`growth-${index}`}
                  id={`growth-${index}`}
                  growth={growth}
                  onUpdate={(updated) => handleUpdateGrowth(index, updated)}
                  onRemove={() => handleRemoveGrowth(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
