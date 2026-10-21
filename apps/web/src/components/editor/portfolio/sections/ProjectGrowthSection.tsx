'use client';

import type { PortfolioProject, GrowthExperience } from '@silverbeen/types';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Sparkles } from 'lucide-react';
import { SortableGrowthItem } from '../SortableItems';
import { useDndSensors } from '@/hooks/useDndSensors';
import { getItemId, moveItemById, withId } from '@/utils/ids';

interface ProjectGrowthSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(key: K, value: PortfolioProject[K]) => void;
}

export function ProjectGrowthSection({ project, onChange }: ProjectGrowthSectionProps) {
  const sensors = useDndSensors();
  const growths = project.growthExperience ?? [];
  const ids = growths.map(getItemId);

  const handleAdd = () => {
    onChange('growthExperience', [
      ...growths,
      withId<GrowthExperience>({ title: '', content: '' }),
    ]);
  };

  const handleUpdate = (id: string, updated: GrowthExperience) => {
    onChange(
      'growthExperience',
      growths.map((growth) => (getItemId(growth) === id ? updated : growth)),
    );
  };

  const handleRemove = (id: string) => {
    onChange(
      'growthExperience',
      growths.filter((growth) => getItemId(growth) !== id),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const reordered = moveItemById(growths, String(active.id), String(over.id));
    if (reordered) onChange('growthExperience', reordered);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Sparkles className="text-primary-500 h-4 w-4" />
            성장 경험
          </h5>
          {growths.length > 1 && (
            <span className="text-xs text-gray-400">드래그하여 순서 변경</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>
      {growths.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-gray-200 py-4 text-center text-sm text-gray-400 dark:border-gray-600">
          성장 경험을 추가해주세요
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {growths.map((growth, index) => (
                <SortableGrowthItem
                  key={ids[index]}
                  id={ids[index]}
                  growth={growth}
                  onUpdate={(updated) => handleUpdate(ids[index], updated)}
                  onRemove={() => handleRemove(ids[index])}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
